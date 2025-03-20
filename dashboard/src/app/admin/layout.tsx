import AWSAgent from "../components/AWSAgent";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      {/* Left side - Main content */}
      <div className="flex-1 overflow-auto p-4">
        {children}
      </div>
      
      {/* Right side - AWS Agent */}
      <div className="w-1/4 border-l border-gray-200 bg-gray-50 p-4">
        <AWSAgent />
      </div>
    </div>
  );
}

