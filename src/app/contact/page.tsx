"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MessageCircle,
  Clock3,
  Loader2,
  Send,
  Search,
  UploadCloud,
  Paperclip,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { toast } from "sonner";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState(false);

  const [ticketId, setTicketId] = useState("");
  const [ticket, setTicket] = useState<any>(null);

  const [attachment, setAttachment] = useState<File | null>(null);
  const [category, setCategory] = useState("General");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();

      Object.entries(form).forEach(([k, v]) =>
        formData.append(k, v)
      );

      formData.append("category", category);

      if (attachment) {
        formData.append("file", attachment);
      }

      const res = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed");
        return;
      }

      toast.success(`Ticket Created: ${data.ticketId}`);

      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });

      setAttachment(null);
    } catch (error) {
  console.error(error);

  toast.error(
    error instanceof Error
      ? error.message
      : "Something went wrong"
  );
} finally {
      setLoading(false);
    }
  }

  async function trackTicket() {
    if (!ticketId) return;

    try {
      setTracking(true);

      const res = await fetch(`/api/support/status/${ticketId}`);
      const data = await res.json();

      setTicket(data);
    } finally {
      setTracking(false);
    }
  }



  return (
    <main className="min-h-screen bg-background pb-0 md:pb-10">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/40 py-20">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/15 via-background to-background" />

        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-[#D4AF37]/5 blur-3xl" />

        <div className="relative mx-auto flex max-w-7xl items-center justify-center px-4 text-center sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-4 py-2 backdrop-blur-sm">
              <MessageCircle className="h-4 w-4 text-[#D4AF37]" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                24/7 Customer Support
              </span>
            </div>

            {/* Heading */}
            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight md:text-6xl lg:text-7xl">
              Need Help?
              <span className="block bg-gradient-to-r from-[#D4AF37] via-[#F5D76E] to-[#D4AF37] bg-clip-text text-transparent">
                We're Always Available
              </span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Get fast assistance for airtime purchases, data subscriptions,
              electricity bills, wallet funding, failed transactions, account
              verification, and all other platform-related issues.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 md:px-8 py-15 space-y-10">
        {/* PREMIUM CONTACT CARDS */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: Mail,
              title: "Email Support",
              value: "jelilioladunjoye04@gmail.com",
              href: "mailto:jelilioladunjoye04@gmail.com"
            },
            {
              icon: Phone,
              title: "Phone Support",
              value: "+234 707 405 2461",
              href: "tel:+2347074052461",
            },
            {
              icon: MessageCircle,
              title: "WhatsApp",
              value: "+234 707 405 2461",
              href: "https://wa.me/2347074052461",
            },
            {
              icon: Clock3,
              title: "Availability",
              value: "24/7 Support",
              href: "/contact",
            },
          ].map((item, i) => (
            <Link
              key={i}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              className="group block"
            >
              <Card className="overflow-hidden rounded-[28px] border-border/50 bg-card transition-all duration-300 hover:-translate-y-2 hover:border-[#D4AF37]/40 hover:shadow-2xl hover:shadow-[#D4AF37]/10">
                <CardContent  className="relative z-10 flex flex-col items-center text-center">
                  <div className="absolute right-0 top-0 h-20 w-24  rounded-full bg-[#D4AF37]/5 blur-2xl transition-all duration-300 group-hover:bg-[#D4AF37]/15 " />

                  <div className="relative z-10 justify-center items-center gap-4 text-center">
                    <div  className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF37]/10">
                      <item.icon className="h-7 w-7 text-[#D4AF37] transition-colors duration-300 group-hover:text-black" />
                    </div>

                    <h3 className="font-black text-lg transition-colors group-hover:text-[#D4AF37]">
                      {item.title}
                    </h3>

                    <p className="mt-2 break-words text-sm text-muted-foreground">
                      {item.value}
                    </p>

                    <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#D4AF37]">
                      Contact Now
                      <MessageCircle className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* TRACK + FORM */}
        <div className="grid gap-6 xl:grid-cols-12">
          {/* TRACK TICKET */}
          <Card className="xl:col-span-4 rounded-[30px] border-border/50">
            <CardContent className="md:p-7">
              <div className="mb-6">
                <h2 className="text-2xl font-black">Track Ticket</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Check the progress of your support request.
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  placeholder="SUP-123456"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  className="h-12 rounded-xl"
                />

                <Button
                  onClick={trackTicket}
                  className="h-12 w-full rounded-xl bg-[#D4AF37] text-black hover:bg-[#e6c04a]"
                >
                  {tracking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Track Ticket
                    </>
                  )}
                </Button>

                {ticket && (
                  <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Status
                      </span>

                      <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-500">
                        {ticket.status}
                      </span>
                    </div>

                    <p className="mt-4 text-sm">
                      {ticket.adminReply || "Awaiting support response"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SUPPORT FORM */}
          <Card className="xl:col-span-8 rounded-[30px] border-border/50">
            <CardContent className="md:p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-black">Submit A Support Ticket</h2>

                <p className="mt-2 text-muted-foreground">
                  Tell us about your issue and we'll respond as quickly as
                  possible.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    className="h-12 rounded-xl"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                  />

                  <Input
                    type="email"
                    className="h-12 rounded-xl"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                <Input
                  className="h-12 rounded-xl"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value,
                    })
                  }
                />

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-12 w-full rounded-xl border bg-background px-4"
                >
                  <option>General</option>
                  <option>Failed Data</option>
                  <option>Failed Airtime</option>
                  <option>Electricity</option>
                  <option>Wallet Funding</option>
                  <option>Account Issue</option>
                  <option>Other</option>
                </select>

                <Input
                  className="h-12 rounded-xl"
                  placeholder="Subject"
                  value={form.subject}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      subject: e.target.value,
                    })
                  }
                />

                <div className="rounded-3xl border-2 border-dashed border-[#D4AF37]/20 bg-[#D4AF37]/5 p-6 transition-all hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF37]/10">
                      <UploadCloud className="h-7 w-7 text-[#D4AF37]" />
                    </div>

                    <h3 className="text-sm font-bold">
                      Upload Supporting Evidence
                    </h3>

                    <p className="mt-2 max-w-md text-xs text-muted-foreground">
                      Attach screenshots, payment receipts, transaction proofs,
                      failed purchase evidence, or any document that will help
                      our support team resolve your issue faster.
                    </p>

                    <label
                      htmlFor="attachment"
                      className="mt-5 cursor-pointer rounded-xl bg-[#D4AF37] px-5 py-2.5 text-sm font-bold text-black transition-all hover:bg-[#E5C158]"
                    >
                      Choose File
                    </label>

                    <Input
                      id="attachment"
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) =>
                        setAttachment(e.target.files?.[0] || null)
                      }
                    />

                    {attachment && (
                      <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#D4AF37]/20 bg-background px-4 py-2">
                        <Paperclip className="h-4 w-4 text-[#D4AF37]" />
                        <span className="max-w-[220px] truncate text-xs font-medium">
                          {attachment.name}
                        </span>
                      </div>
                    )}

                    <p className="mt-3 text-[11px] text-muted-foreground">
                      PNG, JPG, JPEG or PDF • Max 5MB
                    </p>
                  </div>
                </div>

                <Textarea
                  rows={7}
                  placeholder="Describe your issue in detail..."
                  value={form.message}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      message: e.target.value,
                    })
                  }
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-[#D4AF37] text-black font-bold hover:bg-[#e6c04a]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Ticket...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Support Ticket
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <Card className="rounded-[30px] border-border/50">
          <CardContent className="md:p-8">
            <h2 className="mb-6 text-3xl font-black">
              Frequently Asked Questions
            </h2>

            <Accordion type="single" collapsible>
              <AccordionItem value="1">
                <AccordionTrigger>Data not received?</AccordionTrigger>
                <AccordionContent>
                  Wait 5 minutes, restart your device, then contact support if
                  the issue persists.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="2">
                <AccordionTrigger>Failed airtime purchase?</AccordionTrigger>
                <AccordionContent>
                  Failed airtime transactions are usually refunded
                  automatically.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="3">
                <AccordionTrigger>Wallet funding issue?</AccordionTrigger>
                <AccordionContent>
                  Upload your payment proof and transaction reference when
                  creating a ticket.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
      {/* WHATSAPP BUTTON */}
      {/* <a
        href="https://wa.me/2348012345678"
        target="_blank"
        className="fixed bottom-6 right-6 z-50"
      >
        <Button className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600">
          <MessageCircle className="h-6 w-6" />
        </Button>
      </a> */}
    </main>
  );
}
