import { getCurrentBusiness } from "@/lib/business";
import { AuthCard } from "@/components/AuthCard";
import { ShopifyLinkConfirm } from "@/components/ShopifyLinkConfirm";

// Opened in a normal browser tab from the embedded page. The proxy makes the visitor sign in first.
export default async function ShopifyLinkPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  const business = await getCurrentBusiness();
  return (
    <AuthCard title="Link your Shopify store" subtitle="Confirm to connect it to your LostQuote workspace.">
      {code ? (
        <ShopifyLinkConfirm code={code} businessName={business.name} />
      ) : (
        <p className="text-sm text-danger">This link is incomplete. Go back to Shopify and press “Link to my LostQuote account” again.</p>
      )}
    </AuthCard>
  );
}
