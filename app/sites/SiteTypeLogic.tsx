"use client";

import { useEffect } from "react";

export default function SiteTypeLogic() {
  useEffect(() => {
    const typeSelect = document.getElementById('type') as HTMLSelectElement;
    if (!typeSelect) return;

    const updateFields = () => {
      const systemFields = document.querySelectorAll('.system-field');
      const mockFields = document.querySelectorAll('.mock-field');
      
      if (typeSelect.value === 'TIER4_PUBLIC_OTHERS') {
        // Tier 4: No system, only mock fields
        systemFields.forEach((el: any) => el.style.display = 'none');
        mockFields.forEach((el: any) => el.style.display = 'block');
      } else if (typeSelect.value === 'TIER3_PUBLIC_PSS') {
        // Tier 3: Has PSS system AND needs mock fields for map display
        systemFields.forEach((el: any) => el.style.display = 'block');
        mockFields.forEach((el: any) => el.style.display = 'block');
      } else {
        // Tier 1 & 2: System fields only
        systemFields.forEach((el: any) => el.style.display = 'block');
        mockFields.forEach((el: any) => el.style.display = 'none');
      }
    };

    typeSelect.addEventListener('change', updateFields);
    // Add a slight delay to ensure DOM is fully painted if needed, but synchronous is usually fine
    setTimeout(updateFields, 0);

    return () => {
      typeSelect.removeEventListener('change', updateFields);
    };
  }, []);

  return null;
}
