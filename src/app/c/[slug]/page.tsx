import React from "react";
import { getMagicLinkData } from "@/lib/db/queries";
import { ReceiptView } from "@/components/magic-link/receipt-view";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { formatNaira } from "@/lib/utils";


export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getMagicLinkData(slug);

  if (!data) {
    return {
      title: "Receipt Not Found | NEFTrack",
    };
  }

  const { agreement, merchant, balanceRemainingKobo } = data;
  return {
    title: `${merchant.business_name} - Payment Receipt for ${agreement.title}`,
    description: `Official digital receipt for ${agreement.title}. Balance remaining: ${formatNaira(
      balanceRemainingKobo
    )}. Track your installment payments securely.`,
    openGraph: {
      title: `${merchant.business_name} - Payment Receipt`,
      description: `${agreement.title} • Balance: ${formatNaira(balanceRemainingKobo)}`,
      siteName: "NEFTrack",
    },
  };
}

export default async function MagicLinkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getMagicLinkData(slug);

  if (!data) {
    notFound();
  }

  return <ReceiptView data={data} />;
}
