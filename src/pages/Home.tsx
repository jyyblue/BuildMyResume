import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileText, Github, ArrowRight, CheckCircle, Sparkles, Edit3, MessageSquare, LayoutTemplate, MousePointerClick, Lock, User } from "lucide-react";
import { useState, useEffect } from "react";
import { AppNavigation } from "@/components/AppNavigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { faqItems } from "@/constants/faq";
import GitHubStats from "@/components/GitHubStats";
import ResumeCounter from "@/components/ResumeCounter";

const Home = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const features = [
    {
      icon: <MessageSquare className="h-6 w-6 text-blue-500" />,
      title: "Conversational AI",
      description: "Chat with our intelligent assistant to build your resume naturally, section by section.",
      className: "md:col-span-2 lg:col-span-1"
    },
    {
      icon: <MousePointerClick className="h-6 w-6 text-indigo-500" />,
      title: "Direct Visual Editing",
      description: "Click anywhere on the preview to edit text, adjust margins, and fine-tune your layout instantly.",
      className: "md:col-span-2 lg:col-span-1"
    },
    {
      icon: <FileText className="h-6 w-6 text-pink-500" />,
      title: "Smart PDF Import",
      description: "Upload your old resume and let our AI extract, parse, and perfectly format your data.",
      className: "md:col-span-2 lg:col-span-1"
    },
    {
      icon: <LayoutTemplate className="h-6 w-6 text-orange-500" />,
      title: "Professional Templates",
      description: "Stand out with ATS-optimized, beautifully designed templates that recruiters love.",
      className: "md:col-span-3 lg:col-span-1"
    },
    {
      icon: <Lock className="h-6 w-6 text-green-500" />,
      title: "Privacy First",
      description: "End-to-end encrypted. No accounts required. Your data never leaves your browser.",
      className: "md:col-span-3 lg:col-span-1"
    }
  ];

  const benefits = [
    "No sign-up required",
    "ATS-friendly templates",
    "Multiple export formats",
    "End-to-end encrypted",
    "Open source",
    "Free forever"
  ];

  return (
    <>
      <SEO
        title="Open Source Resume Builder - AI & Classic Editor"
        description="Build professional, ATS-friendly resumes with our privacy-first builder. Choose between our conversational AI assistant or granular classic editor. 100% free and open source."
        keywords="resume builder, resume builder in buildmyresume.live, open source resume builder, ATS friendly resume, professional resume templates, CV builder, AI resume builder, conversational resume, privacy resume builder"
        url={`${import.meta.env.VITE_BASE_URL || 'https://buildmyresume.live'}`}
        image={`${import.meta.env.VITE_BASE_URL || 'https://buildmyresume.live'}/og-image.png`}
      />

      <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20">

        {/* Navigation */}
        <div className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-md border-b' : 'bg-transparent'}`}>
          <AppNavigation showGitHubStar={true} />
        </div>

        {/* Dual-Track Hero Section */}
        <section className="relative pt-24 pb-12 lg:pt-32 lg:pb-16 overflow-hidden">
          {/* Rich Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
            <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse-soft" />
            <div className="absolute top-40 right-10 w-[30rem] h-[30rem] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse-soft delay-1000" />
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[40rem] h-[20rem] bg-primary/10 rounded-full blur-[100px]" />
          </div>

          <div className="container relative mx-auto px-4 text-center z-10">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 backdrop-blur-md border border-border/50 text-sm font-medium animate-slide-up shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Open Source Resume Builder
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-tight max-w-5xl mx-auto">
                Modern Resumes, <br className="hidden md:block" />
                <span className="text-gradient">Built Your Way.</span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Create a professional, ATS-friendly resume in minutes. Build it yourself with our intuitive form editor, or chat with our AI assistant to have it built for you. Always free, private, and ready to download.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center pt-8">
                <Link to="/ai-resume-builder" className="w-full sm:w-auto group">
                  <Button size="lg" className="h-14 px-8 md:h-16 md:px-10 text-base md:text-lg w-full sm:w-auto rounded-full shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] transition-all duration-500 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-none">
                    <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
                    Try AI Builder
                  </Button>
                </Link>
                <Link to="/editor" className="w-full sm:w-auto group">
                  <Button variant="outline" size="lg" className="h-14 px-8 md:h-16 md:px-10 text-base md:text-lg w-full sm:w-auto rounded-full border-2 border-primary/20 hover:border-primary/50 bg-background/50 backdrop-blur-sm transition-all duration-300">
                    <Edit3 className="mr-2 h-5 w-5" />
                    Use Classic Editor
                  </Button>
                </Link>
              </div>

              <div className="pt-8 flex flex-col items-center justify-center gap-6 animate-fade-in delay-200">
                <ResumeCounter />
                <GitHubStats className="text-center" />
              </div>
            </div>
          </div>
        </section>

        {/* Choose Your Path Showcase */}
        <section className="py-24 relative overflow-hidden bg-secondary/30 backdrop-blur-sm border-y">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold">Two Powerful Ways to Build</h2>
              <p className="text-xl text-muted-foreground">
                Choose the workflow that matches your style. Both export to perfect, ATS-friendly PDFs.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">

              {/* Path 1: AI Builder */}
              <Card className="relative overflow-hidden group border-primary/20 bg-background/50 backdrop-blur-xl shadow-2xl hover:shadow-glow transition-all duration-500 flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="text-center pb-2 relative z-10 space-y-4 flex-shrink-0">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl mb-2">The AI Assistant</CardTitle>
                    <p className="text-muted-foreground">Upload an old PDF or just start chatting. The AI builds your ATS-optimized resume in real-time.</p>
                  </div>
                </CardHeader>
                <CardContent className="p-6 relative z-10 flex-grow flex flex-col justify-between">
                  <div className="rounded-xl border bg-card overflow-hidden shadow-inner flex flex-col h-[280px]">
                    {/* Mock AI UI */}
                    <div className="h-8 border-b bg-muted/30 flex items-center px-3 gap-2 flex-shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                      <span className="text-[10px] font-medium text-muted-foreground ml-2 uppercase tracking-wider">AI Builder Session</span>
                    </div>
                    <div className="p-4 space-y-4 bg-background flex-grow">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="bg-muted p-3 rounded-2xl rounded-tl-sm text-sm">
                          Make my experience sound more professional for a Senior Developer role.
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-primary/10 border border-primary/20 p-3 rounded-2xl rounded-tl-sm text-sm">
                          <p className="font-semibold text-primary mb-1">Updated Work Experience</p>
                          <ul className="list-disc pl-4 space-y-1 text-xs text-muted-foreground">
                            <li>Architected highly scalable microservices handling 1M+ requests</li>
                            <li>Mentored junior engineers and led agile development cycles</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 text-center flex-shrink-0">
                    <Link to="/ai-resume-builder">
                      <Button size="lg" className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-14 text-[1rem]">
                        Start Chatting
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Path 2: Classic Editor */}
              <Card className="relative overflow-hidden group border-border bg-background/50 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all duration-500 flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-bl from-cyan-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="text-center pb-2 relative z-10 space-y-4 flex-shrink-0">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-secondary border flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Edit3 className="h-8 w-8 text-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl mb-2">The Classic Editor</CardTitle>
                    <p className="text-muted-foreground">Prefer manual control? Fill out structured forms and edit directly on the live visual preview.</p>
                  </div>
                </CardHeader>
                <CardContent className="p-6 relative z-10 flex-grow flex flex-col justify-between">
                  <div className="rounded-xl border bg-card overflow-hidden shadow-inner flex h-[280px]">
                    {/* Mock Editor UI */}
                    <div className="w-1/3 border-r bg-muted/10 p-3 space-y-3">
                      <div className="h-2 w-1/2 bg-muted-foreground/30 rounded" />
                      <div className="h-6 w-full bg-background border rounded" />
                      <div className="h-2 w-1/3 bg-muted-foreground/30 rounded pt-2" />
                      <div className="h-6 w-full bg-background border rounded" />
                      <div className="h-2 w-2/3 bg-muted-foreground/30 rounded pt-2" />
                      <div className="h-16 w-full bg-background border rounded" />
                    </div>
                    <div className="w-2/3 bg-white p-4 relative">
                      {/* Fake Resume Preview */}
                      <div className="space-y-4">
                        <div className="text-center border-b border-gray-200 pb-3">
                          <div className="h-4 w-1/3 bg-gray-800 rounded mx-auto mb-2" />
                          <div className="h-2 w-1/2 bg-gray-400 rounded mx-auto" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 w-1/4 bg-blue-600 rounded" />
                          <div className="h-2 w-full bg-gray-300 rounded" />
                          <div className="h-2 w-5/6 bg-gray-300 rounded" />
                          <div className="h-2 w-4/6 bg-gray-300 rounded" />
                        </div>
                        <div className="space-y-2 pt-2">
                          <div className="h-2 w-1/4 bg-blue-600 rounded" />
                          <div className="h-2 w-[90%] bg-gray-300 rounded" />
                          <div className="h-2 w-[85%] bg-gray-300 rounded" />
                        </div>
                      </div>

                      {/* Cursor Mock */}
                      <div className="absolute top-[140px] right-[80px] w-6 h-6 text-blue-500 animate-bounce -ml-3 -mt-3 pointer-events-none drop-shadow-md">
                        <svg viewBox="0 0 24 24" fill="currentColor" stroke="white" strokeWidth="1"><path d="M7 2l12 11.2l-5.8.5l3.3 7.3l-2.2.9l-3.2-7.4l-4.4 4.5z" /></svg>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 text-center flex-shrink-0">
                    <Link to="/editor">
                      <Button variant="outline" size="lg" className="w-full rounded-xl border-2 hover:bg-secondary h-14 text-[1rem]">
                        Open Editor
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>

        {/* Benefits Scroll */}
        <section className="bg-background py-8 border-b">
          <div className="container mx-auto px-4 overflow-hidden">
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-sm font-medium text-muted-foreground whitespace-nowrap">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Unified Feature Grid */}
        <section className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold">Everything You Need</h2>
              <p className="text-xl text-muted-foreground">
                Built with modern tech for a seamless, private, and powerful experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className={`border-0 shadow-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 group ${feature.className || ''}`}>
                  <CardHeader>
                    <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Video Demo */}
        <section className="py-24 container mx-auto px-4 border-t">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">See It In Action</h2>
            <p className="text-xl text-muted-foreground">
              Watch how easy it is to create a professional resume.
            </p>
          </div>

          <Card className="max-w-5xl mx-auto border-0 shadow-2xl overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
            <div className="relative aspect-video">
              <iframe
                src="https://www.youtube.com/embed/Q_FjVnEu6Es?rel=0&modestbranding=1&showinfo=0"
                title="BuildMyResume Demo"
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </Card>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-secondary/20">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold">Common Questions</h2>
              <p className="text-xl text-muted-foreground">Everything you need to know.</p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg bg-card px-4 shadow-sm">
                  <AccordionTrigger className="text-left hover:no-underline py-4 text-lg font-medium">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px]" />

          <div className="container relative mx-auto px-4 text-center">
            <Card className="max-w-4xl mx-auto bg-background/50 backdrop-blur-md border-primary/20 shadow-2xl p-8 md:p-12 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500" />

              <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Build Your Career?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Join thousands of professionals who have built their resumes with us. Open source, privacy-first, and always free.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/ai-resume-builder">
                  <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 shadow-lg">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start with AI
                  </Button>
                </Link>
                <Link to="/editor">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full bg-background hover:bg-secondary">
                    <Edit3 className="mr-2 h-5 w-5" />
                    Start in Editor
                  </Button>
                </Link>
                <a href="https://github.com/rashidrashiii/BuildMyResume" target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full">
                    <Github className="mr-2 h-5 w-5" />
                    Star on GitHub
                  </Button>
                </a>
              </div>
            </Card>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Home;
