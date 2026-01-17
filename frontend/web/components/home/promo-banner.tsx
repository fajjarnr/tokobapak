import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function PromoBanner() {
    return (
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="space-y-4 text-center md:text-left relative z-10">
            <h2 className="text-3xl font-bold">Download TokoBapak App</h2>
            <p className="max-w-md text-white/90">Get the best shopping experience with our mobile app. Available on iOS and Android.</p>
            <div className="flex gap-4 justify-center md:justify-start">
              <Button variant="secondary" size="lg" className="bg-white text-purple-600 hover:bg-white/90">App Store</Button>
              <Button variant="secondary" size="lg" className="bg-white text-purple-600 hover:bg-white/90">Play Store</Button>
            </div>
          </div>
          <div className="relative h-64 w-full md:w-1/2 max-w-sm z-10 hidden md:block">
            <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <span className="text-2xl font-bold">📱 App Preview</span>
            </div>
          </div>
        </section>
    )
}
