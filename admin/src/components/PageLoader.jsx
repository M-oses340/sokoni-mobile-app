import React from "react";
// Import the icon from lucide-react
import { Loader2 } from "lucide-react"; 

function PageLoader() {
  return (
     <div className="flex items-center justify-center h-screen">
      {/* Change LoaderIcon to Loader2 */}
      <Loader2 className="size-12 animate-spin text-primary" />
    </div>
  );
}

export default PageLoader;