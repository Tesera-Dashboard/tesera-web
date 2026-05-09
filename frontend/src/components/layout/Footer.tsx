import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <span className="font-bold inline-block text-xl tracking-tight mb-4">Tesera</span>
            <p className="text-sm text-muted-foreground pr-4">
              AI-powered operations assistant platform for modern SMEs, cooperatives, and e-commerce businesses.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="#integrations" className="hover:text-foreground transition-colors">Integrations</Link></li>
              <li><Link href="#changelog" className="hover:text-foreground transition-colors">Changelog</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#about" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link href="#careers" className="hover:text-foreground transition-colors">Careers</Link></li>
              <li><Link href="#blog" className="hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link href="#contact" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="#terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="#security" className="hover:text-foreground transition-colors">Security</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Tesera. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#twitter" className="hover:text-foreground transition-colors">Twitter</Link>
            <Link href="#linkedin" className="hover:text-foreground transition-colors">LinkedIn</Link>
            <Link href="#github" className="hover:text-foreground transition-colors">GitHub</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
