import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/lib/business";
import { getLookups } from "@/lib/lookups";
import { todayIn } from "@/lib/format";
import { PageHeader } from "@/components/ui";
import { QuotationForm } from "@/components/QuotationForm";

export default async function NewQuotationPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>;
}) {
  const { customer = "" } = await searchParams;
  const business = await getCurrentBusiness();
  if (business.role === "viewer") redirect("/quotations");
  const { statuses, categories, customers } = await getLookups();
  const defaultStatus = statuses.find((s) => s.name === "Sent") ?? statuses.find((s) => s.kind === "open") ?? statuses[0];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="New quotation" />
      <QuotationForm
        businessId={business.id}
        userId={business.userId}
        customers={customers}
        statuses={statuses}
        categories={categories}
        today={todayIn(business.timezone)}
        followupDays={business.followupDays}
        canEdit
        canDelete={false}
        initial={{
          customer_id: customers.some((c) => c.id === customer) ? customer : "",
          category_id: "",
          status_id: defaultStatus?.id ?? "",
          title: "",
          description: "",
          amount: "",
          currency: business.currency,
          collected_amount: "",
          expected_response_at: "",
          internal_notes: "",
          items: [],
        }}
      />
    </div>
  );
}
