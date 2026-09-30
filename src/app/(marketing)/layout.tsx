import { MarketingHeader } from "@/components/MarketingHeader";
import { MarketingFooter } from "@/components/MarketingFooter";
import { ChatWidget } from "@/components/marketing/ChatWidget";
import { ScrollProgress } from "@/components/marketing/ScrollProgress";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col bg-white">
      <ScrollProgress />
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
      <ChatWidget />
    </div>
  );
}
