import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-12 border-t border-white/5 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Futuristic accent line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brightGreen/30 to-transparent"></div>
      
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-brightGreen">
              Swan City
            </h3>
            <p className="text-gray-400 mb-6 max-w-md font-light">
              Pioneering the future of AI-driven solutions for businesses seeking innovation and growth in the digital landscape.
            </p>
            <div className="flex space-x-4">
              {['twitter', 'linkedin', 'github', 'instagram'].map((social) => (
                <Link 
                  key={social}
                  href={`https://${social}.com`} 
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-brightGreen hover:text-black transition-all"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{social}</span>
                  <i className={`fab fa-${social}`}></i>
                </Link>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Solutions</h4>
            <ul className="space-y-2">
              {['AI Integration', 'Data Analytics', 'Machine Learning', 'Automation'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-gray-400 hover:text-brightGreen transition-colors font-light">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Company</h4>
            <ul className="space-y-2">
              {['About Us', 'Careers', 'Blog', 'Contact'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-gray-400 hover:text-brightGreen transition-colors font-light">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm font-light">
            © {new Date().getFullYear()} Swan City. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="text-gray-500 text-sm hover:text-brightGreen font-light">
              Privacy Policy
            </Link>
            <Link href="#" className="text-gray-500 text-sm hover:text-brightGreen font-light">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
      
      {/* Futuristic UI element */}
      <div className="absolute bottom-4 right-4 hidden md:block">
        <div className="text-xs text-gray-500 font-mono">
          <div className="flex items-center">
            <div className="h-1 w-3 bg-brightGreen opacity-50 mr-1"></div>
            <div>SYSTEM.ACTIVE</div>
          </div>
        </div>
      </div>
    </footer>
  );
}