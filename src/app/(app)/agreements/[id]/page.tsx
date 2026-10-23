import React from "react";
import { getSession } from "@/lib/auth/session";
import { getAgreementById } from "@/lib/db/queries";
import { notFound } from "next/navigation";
import { ClientDetailView } from "./client-detail-view";


export default async function AgreementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const merchantId = session?.id || "mer_adebayo_ikeja_01";

  const data = await getAgreementById(merchantId, id);

  if (!data) {
    notFound();
  }

  return <ClientDetailView agreement={data.agreement} payments={data.payments} />;
}
