
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, Shield, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      icon: <Wallet className="h-8 w-8 text-blue-600" />,
      title: "Kelola Dompet",
      description: "Atur multiple dompet dan rekening bank dengan mudah"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-green-600" />,
      title: "Analisis Keuangan",
      description: "Dapatkan insight mendalam tentang pola keuangan Anda"
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-600" />,
      title: "Aman & Privat",
      description: "Data keuangan Anda dilindungi dengan enkripsi tingkat bank"
    },
    {
      icon: <Smartphone className="h-8 w-8 text-orange-600" />,
      title: "Mobile Friendly",
      description: "Akses dimana saja, kapan saja dengan antarmuka yang responsif"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Cashari</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="ghost">Masuk</Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-blue-600 hover:bg-blue-700">Mulai Gratis</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Kelola Keuangan Anda dengan
            <span className="text-blue-600 block">Lebih Smart</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Cashari membantu Anda melacak pengeluaran, mengatur budget, dan mencapai 
            tujuan keuangan dengan antarmuka yang modern dan intuitif.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
                Mulai Sekarang - Gratis
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                Lihat Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Fitur yang Membuat Hidup Lebih Mudah
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk mengelola keuangan personal dalam satu aplikasi
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-2">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Siap Mengambil Kontrol Keuangan Anda?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Bergabung dengan ribuan pengguna yang sudah merasakan kemudahan mengelola keuangan dengan Cashari
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Daftar Sekarang - 100% Gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">Cashari</span>
          </div>
          <p className="text-gray-400">
            © 2025 Cashari. Mengelola keuangan dengan lebih smart.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
