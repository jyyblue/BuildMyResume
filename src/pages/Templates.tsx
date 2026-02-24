import { useState, useEffect } from "react";
import { templateConfigs } from "@/templates";
import { Button } from "@/components/ui/button";

import { ResumeData, Language } from "@/contexts/ResumeContext";
import { useNavigate, Link } from "react-router-dom";
import { FileText, ArrowLeft, Github, Star, Download, Search, LayoutTemplate } from "lucide-react";
import { AppNavigation } from "@/components/AppNavigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Helmet } from "react-helmet-async";
import sampleData from "@/data/sample.json";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const fixSampleLanguages = (languages: any[]): Language[] =>
  languages.map((lang) => ({
    ...lang,
    proficiency: ["Native", "Conversational", "Basic", "Fluent"].includes(lang.proficiency)
      ? lang.proficiency
      : "Basic"
  })) as Language[];

const fixedSampleData: ResumeData = {
  ...sampleData,
  languages: fixSampleLanguages(sampleData.languages),
  customSections: []
};

const Templates = () => {
  const navigate = useNavigate();
  const categories = [
    "All",
    ...Array.from(new Set(templateConfigs.map((t) => t.category)))
  ];
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredTemplates = templateConfigs.filter((t) => {
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Generate structured data for templates
  const templateStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Professional Resume Templates",
    "description": "Collection of professional, ATS-friendly resume templates for job seekers",
    "url": `${import.meta.env.VITE_BASE_URL || 'https://buildmyresume.live'}/templates`,
    "numberOfItems": templateConfigs.length,
    "itemListElement": templateConfigs.map((template, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": template.name,
        "description": template.description,
        "category": template.category,
        "image": `${import.meta.env.VITE_BASE_URL || 'https://buildmyresume.live'}${template.previewImage}`,
        "url": `${import.meta.env.VITE_BASE_URL || 'https://buildmyresume.live'}/editor?template=${template.id}`,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "description": `Free ${template.category.toLowerCase()} resume template`
        }
      }
    }))
  };

  return (
    <>
      <SEO
        title="Free Resume Templates - Professional ATS-Friendly Designs | BuildMyResume"
        description="Download free professional resume templates that are ATS-friendly and perfect for job applications. Choose from 15+ modern, creative, and traditional designs. No sign-up required."
        keywords="free resume templates, ATS friendly resume templates, professional resume designs, modern resume templates, creative resume templates, job application templates, CV templates, downloadable resume templates"
        url={`${import.meta.env.VITE_BASE_URL || 'https://buildmyresume.live'}/templates`}
        image={`${import.meta.env.VITE_BASE_URL || 'https://buildmyresume.live'}/templates-preview.png`}
      />

      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(templateStructuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background selection:bg-primary/20">
        <div className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
          <AppNavigation showGitHubButton={true} />
        </div>

        <main className="container mx-auto px-4 pt-32 pb-20">
          {/* Header Section */}
          <div className="text-center space-y-6 mb-16 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative relative z-10 space-y-4 animate-fade-in">
              <Badge variant="outline" className="px-4 py-1.5 text-sm border-primary/20 bg-primary/5 text-primary mb-2">
                Drafted by Experts
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Professional Resume <br className="hidden sm:block" />
                <span className="text-gradient">Templates Library</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Choose from our collection of <span className="font-semibold text-foreground">ATS-friendly</span> templates.
                Designed to pass screening bots and impress hiring managers.
              </p>
            </div>

            {/* Search and Filter */}
            <div className="max-w-xl mx-auto relative z-10">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search templates (e.g., 'Modern', 'Minimal')..."
                  className="pl-12 h-14 rounded-full border-border/50 bg-background/50 backdrop-blur-sm shadow-sm focus:shadow-md focus:border-primary/50 transition-all text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12 animate-fade-in delay-100">
            {categories.map((category, index) => (
              <Button
                key={index}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-6 transition-all duration-300 ${selectedCategory === category
                    ? 'shadow-lg shadow-primary/25'
                    : 'hover:bg-secondary/80 bg-background/50 backdrop-blur-sm'
                  }`}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Templates Grid */}
          {filteredTemplates.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in delay-200">
              {filteredTemplates.map((template, index) => (
                <div
                  key={template.id}
                  className="group relative rounded-2xl glass-card overflow-hidden cursor-pointer flex flex-col h-full"
                  onClick={() => navigate(`/editor?template=${template.id}`)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative aspect-[1/1.4] w-full overflow-hidden bg-muted/20">
                    <img
                      src={template.previewImage}
                      alt={`${template.name} resume template`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                      <Button className="bg-white text-black hover:bg-white/90 shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <LayoutTemplate className="w-4 h-4 mr-2" />
                        Use This Template
                      </Button>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1 border-t border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-xl font-bold group-hover:text-primary transition-colors">{template.name}</h2>
                      <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-1">No templates found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or category filter.
              </p>
              <Button
                variant="link"
                onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
                className="mt-2 text-primary"
              >
                Clear all filters
              </Button>
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-24 relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-purple-500/5 to-blue-500/10 border border-primary/10">
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <FileText className="w-64 h-64 text-primary" />
            </div>

            <div className="relative z-10 px-6 py-16 md:px-12 text-center max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Still Unsure?</h2>
              <p className="text-xl text-muted-foreground">
                You can switch templates at any time while editing without losing your content.
                Start with any design and find your perfect match later.
              </p>
              <Button size="lg" onClick={() => navigate('/editor')} className="rounded-full px-8 h-12 text-lg shadow-lg hover:shadow-xl transition-all">
                Start with Blank Template
                <ArrowLeft className="h-5 w-5 ml-2 rotate-180" />
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Templates;