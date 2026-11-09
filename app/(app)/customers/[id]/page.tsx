import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";
import { CustomerForm } from "@/components/CustomerForm";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const { data: c } = await supabase.from("customers").select("*").eq("id", id).maybeSingle();
  if (!c) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-semibold text-navy">{c.name}</h1>
      <CustomerForm
        businessId={business.id}
        userId={business.userId}
        canEdit={business.role !== "viewer"}
        canDelete={business.role === "owner" || business.role === "admin"}
        initial={{
          id: c.id,
          type: c.type,
          name: c.name,
          company_name: c.company_name ?? "",
          email: c.email ?? "",
          phone: c.phone ?? "",
          country: c.country ?? "",
          notes: c.notes ?? "",
          personality: c.personality ?? "",
        }}
      />
    </div>
  );
}
