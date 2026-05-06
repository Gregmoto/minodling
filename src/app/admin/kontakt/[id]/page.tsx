export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Mail, Clock, User, MessageSquare, CheckCircle2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { TicketReplyForm, TicketStatusSelect, TicketDeleteButton } from "./TicketActions";

export const metadata: Metadata = { title: "Ärende | Admin" };

const STATUS_LABEL: Record<string, string> = {
  open:        "Öppen",
  in_progress: "Pågår",
  closed:      "Stängd",
};
const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "default"> = {
  open:        "danger",
  in_progress: "warning",
  closed:      "success",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const ticket = await prisma.contactTicket.findUnique({ where: { id } });
  if (!ticket) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">
              {ticket.subject ?? `Meddelande från ${ticket.name}`}
            </h1>
            <Badge variant={STATUS_VARIANT[ticket.status] ?? "default"}>
              {STATUS_LABEL[ticket.status] ?? ticket.status}
            </Badge>
          </div>
          <p className="text-gray-500 text-sm">{formatDate(ticket.createdAt)}</p>
        </div>
        <Link href="/admin/kontakt" className="text-sm text-gray-500 hover:text-gray-700">
          ← Alla ärenden
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Vänster: meddelande + svar */}
        <div className="md:col-span-2 space-y-4">

          {/* Ursprungligt meddelande */}
          <Card padding="md">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-sage-100 flex items-center justify-center">
                <User className="h-4 w-4 text-sage-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{ticket.name}</p>
                <a href={`mailto:${ticket.email}`}
                  className="text-xs text-green-700 hover:underline font-mono">
                  {ticket.email}
                </a>
              </div>
            </div>
            {ticket.subject && (
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-medium">
                Ämne: {ticket.subject}
              </p>
            )}
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-100">
              {ticket.message}
            </div>
          </Card>

          {/* Befintligt svar (om finns) */}
          {ticket.reply && (
            <Card padding="md">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Ditt svar</p>
                  {ticket.repliedAt && (
                    <p className="text-xs text-gray-400">{formatDate(ticket.repliedAt)}</p>
                  )}
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border border-green-100">
                {ticket.reply}
              </div>
            </Card>
          )}

          {/* Svarsformulär */}
          <Card padding="md">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-4 w-4 text-sage-600" />
              <h2 className="font-semibold text-gray-900">
                {ticket.reply ? "Skicka nytt svar" : "Svara kunden"}
              </h2>
            </div>
            <TicketReplyForm ticketId={ticket.id} hasReply={!!ticket.reply && ticket.status === "closed"} />
          </Card>
        </div>

        {/* Höger: info + status */}
        <div className="space-y-4">

          {/* Kundinfo */}
          <Card padding="md">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Kundinformation</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-gray-700">{ticket.name}</span>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <a href={`mailto:${ticket.email}`}
                  className="text-green-700 hover:underline break-all font-mono text-xs">
                  {ticket.email}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-gray-500 text-xs">{formatDate(ticket.createdAt)}</span>
              </div>
            </div>
            <a
              href={`mailto:${ticket.email}?subject=Re: ${encodeURIComponent(ticket.subject ?? "Ditt meddelande")}`}
              className="mt-4 flex items-center justify-center gap-2 w-full px-3 py-2 border border-gray-200 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Öppna i e-postklient
            </a>
          </Card>

          {/* Statushantering */}
          <Card padding="md">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Status</h3>
            <TicketStatusSelect ticketId={ticket.id} currentStatus={ticket.status} />
            {ticket.adminNote && (
              <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-xs font-medium text-amber-700 mb-1">Intern anteckning</p>
                <p className="text-xs text-amber-600">{ticket.adminNote}</p>
              </div>
            )}
          </Card>

          {/* Radera */}
          <Card padding="md">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Åtgärder</h3>
            <TicketDeleteButton ticketId={ticket.id} />
          </Card>
        </div>
      </div>
    </div>
  );
}
