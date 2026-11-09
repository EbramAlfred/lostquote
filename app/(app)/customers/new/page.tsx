import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/lib/business";
import { CustomerForm, EMPTY_CUSTOMER } from "@/components/CustomerForm";

export default async function NewCustomerPage() {
  const business = await getCurrentBusiness();
  if (business.role === "viewer") redirect("/customers");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-semibold text-navy">Add customer</h1>
      <CustomerForm
        businessId={business.id}
        userId={business.userId}
        initial={EMPTY_CUSTOMER}
        canEdit
        canDelete={false}
      />
    </div>
  );
}
