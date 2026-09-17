"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { ChevronDown, ChevronUp, Loader2, Lock, ShieldCheck } from "lucide-react";
import { formatCents, cn } from "@/lib/utils";
import { PixelScripts, usePixelSettings } from "@/components/PixelScripts";

type ShippingSettings = {
  label: string;
  estimatedDays: string;
  priceCents: number;
};

type PublicPixelSettings = {
  metaPixelId: string | null;
  tiktokPixelId: string | null;
  googleAdsId: string | null;
  googleConversionLabel: string | null;
  ga4MeasurementId: string | null;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  priceCents: number;
  compareAtCents: number | null;
  currency: string;
  requiresShipping: boolean;
  taboolaPixelId: string | null;
};

type FormState = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
};

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

const FULL_NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ'-]{2,}(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ'-]{2,})+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
const CITY_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ'\-\s]{2,}$/;
const ZIP_REGEX = /^\d{5}(-\d{4})?$/;
// NANP (US/Canada) rule: area code and exchange code can't start with 0 or 1.
const US_PHONE_DIGITS_REGEX = /^[2-9]\d{2}[2-9]\d{6}$/;

function usPhoneDigits(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
}

function formatUsPhone(value: string): string {
  const digits = usPhoneDigits(value).slice(0, 10);
  const area = digits.slice(0, 3);
  const exchange = digits.slice(3, 6);
  const line = digits.slice(6, 10);
  if (digits.length > 6) return `(${area}) ${exchange}-${line}`;
  if (digits.length > 3) return `(${area}) ${exchange}`;
  if (digits.length > 0) return `(${area}`;
  return "";
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

function validateContactFields(form: FormState, requiresShipping: boolean): FieldErrors {
  const errors: FieldErrors = {};

  if (!FULL_NAME_REGEX.test(form.customerName.trim())) {
    errors.customerName = "Enter your first and last name";
  }
  if (!EMAIL_REGEX.test(form.customerEmail.trim())) {
    errors.customerEmail = "Enter a valid email address";
  }
  if (!US_PHONE_DIGITS_REGEX.test(usPhoneDigits(form.customerPhone))) {
    errors.customerPhone = "Enter a valid US phone number";
  }

  if (requiresShipping) {
    if (form.shippingAddressLine1.trim().length < 3) {
      errors.shippingAddressLine1 = "Enter your street address";
    }
    if (form.shippingAddressLine2.trim().length < 1) {
      errors.shippingAddressLine2 = "Enter apartment, suite, etc.";
    }
    if (!CITY_REGEX.test(form.shippingCity.trim())) {
      errors.shippingCity = "Enter a valid city";
    }
    if (!form.shippingState) {
      errors.shippingState = "Select a state";
    }
    if (!ZIP_REGEX.test(form.shippingPostalCode.trim())) {
      errors.shippingPostalCode = "Enter a valid ZIP code";
    }
  }

  return errors;
}

const fieldErrorClass = "mt-1 text-xs text-red-600";
const errorInputClass = "border-red-400 focus:border-red-500 focus:ring-red-500";

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-3 text-base text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900";

// Fixed, full-width CTA on mobile so the primary action is always one tap away without
// scrolling; on desktop it collapses back into the normal in-flow button.
const ctaButtonClass =
  "fixed inset-x-0 bottom-0 z-30 rounded-none py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] text-base font-semibold shadow-[0_-4px_16px_rgba(0,0,0,0.08)] transition hover:brightness-90 disabled:opacity-50 lg:static lg:z-auto lg:w-full lg:rounded-md lg:py-3.5 lg:pb-3.5 lg:shadow-none";

type Step = 1 | 2 | 3;

export function CheckoutClient({
  product,
  initialLogoUrl = null,
  initialShipping,
  initialPixelSettings,
  initialAnnouncementBar,
  initialButtonColors,
  stripePublishableKey,
}: {
  product: Product;
  initialLogoUrl?: string | null;
  initialShipping?: ShippingSettings;
  initialPixelSettings?: PublicPixelSettings;
  initialAnnouncementBar?: {
    enabled: boolean;
    text: string;
    bgColor: string;
    textColor: string;
    fontSize: number;
  };
  initialButtonColors?: { bg: string; text: string };
  stripePublishableKey: string;
}) {
  const searchParams = useSearchParams();
  const pixelSettings = usePixelSettings(initialPixelSettings);
  const stripePromise = useMemo(
    () => (stripePublishableKey ? loadStripe(stripePublishableKey) : null),
    [stripePublishableKey]
  );

  const steps = product.requiresShipping
    ? [
        { n: 1 as Step, label: "Contact" },
        { n: 2 as Step, label: "Shipping" },
        { n: 3 as Step, label: "Payment" },
      ]
    : [
        { n: 1 as Step, label: "Contact" },
        { n: 3 as Step, label: "Payment" },
      ];

  const [step, setStep] = useState<Step>(1);
  const [quantity, setQuantity] = useState(1);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddressLine1: "",
    shippingAddressLine2: "",
    shippingCity: "",
    shippingState: "",
    shippingPostalCode: "",
    shippingCountry: "US",
  });
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const shipping: ShippingSettings =
    initialShipping ?? { label: "Standard Shipping", estimatedDays: "5-7 business days", priceCents: 599 };
  const logoUrl = initialLogoUrl;
  const announcementBar = initialAnnouncementBar ?? {
    enabled: true,
    text: "You've got free shipping!",
    bgColor: "#008060",
    textColor: "#ffffff",
    fontSize: 12,
  };
  const buttonColors = initialButtonColors ?? { bg: "#008060", text: "#ffffff" };

  const shippingDecided = !product.requiresShipping || step >= 2;
  const shippingCents = product.requiresShipping ? shipping.priceCents : 0;
  const subtotalCents = product.priceCents * quantity;
  const totalCents = subtotalCents + shippingCents;

  const utm = useMemo(
    () => ({
      utmSource: searchParams.get("utm_source") ?? undefined,
      utmMedium: searchParams.get("utm_medium") ?? undefined,
      utmCampaign: searchParams.get("utm_campaign") ?? undefined,
      utmContent: searchParams.get("utm_content") ?? undefined,
      utmTerm: searchParams.get("utm_term") ?? undefined,
      fbclid: searchParams.get("fbclid") ?? undefined,
      gclid: searchParams.get("gclid") ?? undefined,
      ttclid: searchParams.get("ttclid") ?? undefined,
    }),
    [searchParams]
  );

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErrors((errs) => (errs[key] ? { ...errs, [key]: undefined } : errs));
  }

  async function createPaymentIntent() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          ...form,
          ...utm,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.formErrors?.join(", ") ?? data.error ?? "Something went wrong");
        setLoading(false);
        return;
      }
      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
      setStep(3);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors = validateContactFields(form, product.requiresShipping);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    if (product.requiresShipping) {
      setStep(2);
    } else {
      createPaymentIntent();
    }
  }

  function goToStep(n: Step) {
    if (n === step) return;
    setClientSecret(null);
    setStep(n);
  }

  const orderSummary = (
    <OrderSummary
      product={product}
      quantity={quantity}
      setQuantity={setQuantity}
      quantityLocked={step > 1}
      subtotalCents={subtotalCents}
      shippingCents={shippingCents}
      shippingDecided={shippingDecided}
      totalCents={totalCents}
    />
  );

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <PixelScripts settings={pixelSettings} taboolaPixelId={product.taboolaPixelId} taboolaEvent="start_checkout" />

      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-0 lg:px-8">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={product.name} className="h-11 w-auto object-contain lg:h-14" />
          ) : (
            <span className="text-lg font-semibold tracking-tight">{product.name}</span>
          )}
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#008060]">
            <Lock size={13} strokeWidth={2.5} />
            Secure checkout
          </div>
        </div>
      </header>

      {announcementBar.enabled && announcementBar.text && (
        <div
          className="px-4 py-2 text-center font-medium"
          style={{
            backgroundColor: announcementBar.bgColor,
            color: announcementBar.textColor,
            fontSize: announcementBar.fontSize,
          }}
        >
          {announcementBar.text}
        </div>
      )}

      {/* Mobile: always-visible condensed summary, expandable for full breakdown */}
      <div className="border-b border-neutral-200 bg-neutral-50 lg:hidden">
        <button
          onClick={() => setSummaryOpen((v) => !v)}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
        >
          <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-white">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[9px] text-neutral-400">
                No image
              </div>
            )}
          </div>
          <div className="flex flex-1 items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
              {summaryOpen ? "Hide order summary" : "Show order summary"}
              {summaryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
            <span className="text-base font-semibold">{formatCents(totalCents, product.currency)}</span>
          </div>
        </button>
        {summaryOpen && <div className="px-4 pb-5">{orderSummary}</div>}
      </div>

      <div className="mx-auto grid max-w-6xl lg:grid-cols-2">
        {/* Left: form */}
        <div className="px-4 pb-28 pt-6 lg:px-8 lg:py-12">
          <div className="mx-auto max-w-md lg:ml-auto lg:mr-0 lg:max-w-lg">
            {/* Breadcrumb */}
            <nav className="mb-8 flex items-center justify-center gap-2 text-sm">
              {steps.map((s, i) => (
                <div key={s.n} className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={s.n >= step}
                    onClick={() => goToStep(s.n)}
                    className={cn(
                      "font-medium",
                      s.n === step
                        ? "text-neutral-900"
                        : s.n < step
                          ? "text-neutral-500 underline underline-offset-2 hover:text-neutral-900"
                          : "cursor-default text-neutral-300"
                    )}
                  >
                    {s.label}
                  </button>
                  {i < steps.length - 1 && <span className="text-neutral-300">›</span>}
                </div>
              ))}
            </nav>

            {step === 1 && (
              <form onSubmit={handleContactSubmit} className="space-y-8">
                <section>
                  <h2 className="mb-4 text-base font-semibold">Contact information</h2>
                  <div className="space-y-3">
                    <div>
                      <input
                        required
                        autoFocus
                        name="name"
                        autoComplete="name"
                        autoCapitalize="words"
                        placeholder="Jane Doe"
                        className={cn(inputClass, fieldErrors.customerName && errorInputClass)}
                        aria-invalid={!!fieldErrors.customerName}
                        value={form.customerName}
                        onChange={(e) => updateField("customerName", e.target.value)}
                      />
                      {fieldErrors.customerName && <p className={fieldErrorClass}>{fieldErrors.customerName}</p>}
                    </div>
                    <div>
                      <input
                        required
                        type="email"
                        name="email"
                        inputMode="email"
                        autoComplete="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        placeholder="jane@example.com"
                        className={cn(inputClass, fieldErrors.customerEmail && errorInputClass)}
                        aria-invalid={!!fieldErrors.customerEmail}
                        value={form.customerEmail}
                        onChange={(e) => updateField("customerEmail", e.target.value)}
                      />
                      {fieldErrors.customerEmail && <p className={fieldErrorClass}>{fieldErrors.customerEmail}</p>}
                    </div>
                    <div>
                      <input
                        required
                        type="tel"
                        name="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="(555) 000-0000"
                        maxLength={14}
                        className={cn(inputClass, fieldErrors.customerPhone && errorInputClass)}
                        aria-invalid={!!fieldErrors.customerPhone}
                        value={form.customerPhone}
                        onChange={(e) => updateField("customerPhone", formatUsPhone(e.target.value))}
                      />
                      {fieldErrors.customerPhone && <p className={fieldErrorClass}>{fieldErrors.customerPhone}</p>}
                    </div>
                  </div>
                </section>

                {product.requiresShipping && (
                  <section>
                    <h2 className="mb-4 text-base font-semibold">Shipping address</h2>
                    <div className="space-y-3">
                      <div>
                        <input
                          required
                          name="address-line1"
                          autoComplete="address-line1"
                          autoCapitalize="words"
                          placeholder="123 Main St"
                          className={cn(inputClass, fieldErrors.shippingAddressLine1 && errorInputClass)}
                          aria-invalid={!!fieldErrors.shippingAddressLine1}
                          value={form.shippingAddressLine1}
                          onChange={(e) => updateField("shippingAddressLine1", e.target.value)}
                        />
                        {fieldErrors.shippingAddressLine1 && (
                          <p className={fieldErrorClass}>{fieldErrors.shippingAddressLine1}</p>
                        )}
                      </div>
                      <div>
                        <input
                          required
                          name="address-line2"
                          autoComplete="address-line2"
                          autoCapitalize="words"
                          placeholder="Apt 4B"
                          className={cn(inputClass, fieldErrors.shippingAddressLine2 && errorInputClass)}
                          aria-invalid={!!fieldErrors.shippingAddressLine2}
                          value={form.shippingAddressLine2}
                          onChange={(e) => updateField("shippingAddressLine2", e.target.value)}
                        />
                        {fieldErrors.shippingAddressLine2 && (
                          <p className={fieldErrorClass}>{fieldErrors.shippingAddressLine2}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <input
                            required
                            name="address-level2"
                            autoComplete="address-level2"
                            autoCapitalize="words"
                            placeholder="New York"
                            className={cn(inputClass, fieldErrors.shippingCity && errorInputClass)}
                            aria-invalid={!!fieldErrors.shippingCity}
                            value={form.shippingCity}
                            onChange={(e) => updateField("shippingCity", e.target.value)}
                          />
                          {fieldErrors.shippingCity && <p className={fieldErrorClass}>{fieldErrors.shippingCity}</p>}
                        </div>
                        <div>
                          <select
                            required
                            name="address-level1"
                            autoComplete="address-level1"
                            className={cn(inputClass, fieldErrors.shippingState && errorInputClass)}
                            aria-invalid={!!fieldErrors.shippingState}
                            value={form.shippingState}
                            onChange={(e) => updateField("shippingState", e.target.value)}
                          >
                            <option value="">State</option>
                            {US_STATES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          {fieldErrors.shippingState && <p className={fieldErrorClass}>{fieldErrors.shippingState}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <input
                            required
                            name="postal-code"
                            inputMode="numeric"
                            autoComplete="postal-code"
                            pattern="[0-9]*"
                            maxLength={10}
                            placeholder="10001"
                            className={cn(inputClass, fieldErrors.shippingPostalCode && errorInputClass)}
                            aria-invalid={!!fieldErrors.shippingPostalCode}
                            value={form.shippingPostalCode}
                            onChange={(e) => updateField("shippingPostalCode", e.target.value)}
                          />
                          {fieldErrors.shippingPostalCode && (
                            <p className={fieldErrorClass}>{fieldErrors.shippingPostalCode}</p>
                          )}
                        </div>
                        <div>
                          <input
                            disabled
                            autoComplete="country-name"
                            value="United States"
                            className={`${inputClass} bg-neutral-100 text-neutral-500`}
                          />
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: buttonColors.bg, color: buttonColors.text }}
                  className={ctaButtonClass}
                >
                  {loading
                    ? "Loading..."
                    : product.requiresShipping
                      ? "Continue to shipping"
                      : "Continue to payment"}
                </button>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <SummaryCard form={form} onChange={() => goToStep(1)} />

                <section>
                  <h2 className="mb-4 text-base font-semibold">Shipping method</h2>
                  <div className="flex items-center justify-between rounded-md border-2 border-neutral-900 bg-neutral-50 px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full border-[5px] border-neutral-900" />
                      <span className="text-sm font-medium">
                        {shipping.label} ({shipping.estimatedDays})
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      {shipping.priceCents > 0 ? formatCents(shipping.priceCents, product.currency) : "Free"}
                    </span>
                  </div>
                </section>

                {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

                <button
                  type="button"
                  onClick={createPaymentIntent}
                  disabled={loading}
                  style={{ backgroundColor: buttonColors.bg, color: buttonColors.text }}
                  className={ctaButtonClass}
                >
                  {loading ? "Loading..." : "Continue to payment"}
                </button>
              </div>
            )}

            {step === 3 && clientSecret && !stripePromise && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                Payment is temporarily unavailable. Please try again shortly.
              </p>
            )}

            {step === 3 && clientSecret && stripePromise && (
              <Elements stripe={stripePromise} options={{ clientSecret, locale: "en", appearance: { theme: "stripe" } }}>
                <PaymentStep
                  totalCents={totalCents}
                  currency={product.currency}
                  orderId={orderId!}
                  form={form}
                  shipping={product.requiresShipping ? shipping : null}
                  onEditContact={() => goToStep(1)}
                  onEditShipping={() => goToStep(2)}
                  buttonColors={buttonColors}
                />
              </Elements>
            )}

            <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-neutral-400">
              <ShieldCheck size={14} />
              All transactions are secure and encrypted
            </div>
          </div>
        </div>

        {/* Right: order summary (desktop) */}
        <div className="hidden border-l border-neutral-200 bg-neutral-50 lg:block">
          <div className="sticky top-0 px-8 py-12">
            <div className="mx-auto max-w-md">{orderSummary}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  form,
  shippingLine,
  onChange,
}: {
  form: FormState;
  shippingLine?: string;
  onChange: () => void;
}) {
  return (
    <section className="space-y-2 rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3.5">
      <div className="flex items-start justify-between gap-4 text-sm">
        <div>
          <p className="text-neutral-500">Contact</p>
          <p className="font-medium">{form.customerEmail}</p>
          {form.shippingAddressLine1 && (
            <p className="mt-1 text-neutral-500">
              {form.shippingAddressLine1}, {form.shippingCity}, {form.shippingState} {form.shippingPostalCode}
            </p>
          )}
        </div>
        <button type="button" onClick={onChange} className="text-sm font-medium underline underline-offset-2">
          Change
        </button>
      </div>
      {shippingLine && (
        <div className="flex items-start justify-between gap-4 border-t border-neutral-200 pt-2 text-sm">
          <div>
            <p className="text-neutral-500">Shipping</p>
            <p className="font-medium">{shippingLine}</p>
          </div>
        </div>
      )}
    </section>
  );
}

function OrderSummary({
  product,
  quantity,
  setQuantity,
  quantityLocked,
  subtotalCents,
  shippingCents,
  shippingDecided,
  totalCents,
}: {
  product: Product;
  quantity: number;
  setQuantity: (q: number) => void;
  quantityLocked: boolean;
  subtotalCents: number;
  shippingCents: number;
  shippingDecided: boolean;
  totalCents: number;
}) {
  return (
    <div>
      <div className="flex gap-4">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-white">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
              No image
            </div>
          )}
          <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-700 text-[11px] font-medium text-white">
            {quantity}
          </span>
        </div>
        <div className="flex flex-1 items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium leading-snug">{product.name}</p>
            {product.description && (
              <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500">{product.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={quantity}
              disabled={quantityLocked}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="rounded-md border border-neutral-300 bg-white px-1.5 py-1 text-xs disabled:opacity-50"
            >
              {[1, 2, 3, 4, 5].map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-2.5 border-t border-neutral-200 pt-5 text-sm">
        <div className="flex justify-between text-neutral-600">
          <span>Subtotal</span>
          <span>{formatCents(subtotalCents, product.currency)}</span>
        </div>
        <div className="flex justify-between text-neutral-600">
          <span>Shipping</span>
          {shippingDecided ? (
            <span>{shippingCents > 0 ? formatCents(shippingCents, product.currency) : "Free"}</span>
          ) : (
            <span className="text-neutral-400">Calculated at next step</span>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-4">
        <span className="text-base font-semibold">Total</span>
        <span className="text-base font-semibold">
          <span className="mr-1.5 text-xs font-normal text-neutral-400">{product.currency.toUpperCase()}</span>
          {formatCents(totalCents, product.currency)}
        </span>
      </div>
    </div>
  );
}

function PaymentStep({
  totalCents,
  currency,
  orderId,
  form,
  shipping,
  onEditContact,
  onEditShipping,
  buttonColors,
}: {
  totalCents: number;
  currency: string;
  orderId: string;
  form: FormState;
  shipping: ShippingSettings | null;
  onEditContact: () => void;
  onEditShipping: () => void;
  buttonColors: { bg: string; text: string };
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentElementReady, setPaymentElementReady] = useState(false);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?orderId=${orderId}`,
      },
    });

    if (submitError) {
      setError(submitError.message ?? "Payment failed. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <SummaryCard
        form={form}
        onChange={onEditContact}
        shippingLine={shipping ? `${shipping.label} — ${shipping.estimatedDays}` : undefined}
      />
      {shipping && (
        <div className="-mt-4 flex justify-end">
          <button type="button" onClick={onEditShipping} className="text-sm font-medium underline underline-offset-2">
            Change shipping
          </button>
        </div>
      )}

      <form onSubmit={handlePay} className="space-y-5">
        <h2 className="text-base font-semibold">Payment</h2>
        <div className="relative min-h-[220px]">
          {!paymentElementReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white text-sm text-neutral-500">
              <Loader2 size={18} className="animate-spin" />
              Loading secure payment form...
            </div>
          )}
          <div
            className={`rounded-md border border-neutral-300 p-4 transition-opacity duration-300 ${
              paymentElementReady ? "opacity-100" : "opacity-0"
            }`}
          >
            <PaymentElement
              onReady={() => setPaymentElementReady(true)}
              options={{ defaultValues: { billingDetails: { address: { country: "US" } } } }}
            />
          </div>
        </div>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={!stripe || !paymentElementReady || submitting}
          style={{ backgroundColor: buttonColors.bg, color: buttonColors.text }}
          className={ctaButtonClass}
        >
          {submitting ? "Processing..." : `Pay now · ${formatCents(totalCents, currency)}`}
        </button>
      </form>
    </div>
  );
}
