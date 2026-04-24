const fs = require('fs');

function updateForm(filePath) {
    let c = fs.readFileSync(filePath, 'utf8');

    // Add .system-field to packageId wrapper
    c = c.replace(
        /<div className="space-y-2">\s*<label htmlFor="packageId"/,
        '<div className="space-y-2 system-field">\n                      <label htmlFor="packageId"'
    );

    // Add .system-field to contactLink wrapper
    c = c.replace(
        /<div className="space-y-2">\s*<label htmlFor="contactLink"/,
        '<div className="space-y-2 system-field">\n                      <label htmlFor="contactLink"'
    );
    
    // Add .system-field to the checkboxes wrapper
    // The checkboxes are inside a <div className="space-y-4 bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 mt-6">
    // or similar. Let's find "bg-indigo-50/50" or something.
    c = c.replace(
        /<div className="space-y-4 bg-[^"]+ p-5 rounded-2xl[^"]+ mt-6">/,
        (match) => match.replace('className="', 'className="system-field ')
    );

    // Add mockParkingFee input right after maxVehicles
    // Actually, put it after the type select
    const mockField = `
                  <div className="space-y-2 col-span-1 md:col-span-2 mock-field" style={{display: 'none'}}>
                      <label htmlFor="mockParkingFee" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      รายละเอียดค่าจอดรถ (แสดงบนแผนที่)
                      </label>
                      <input
                      type="text"
                      name="mockParkingFee"
                      id="mockParkingFee"
                      placeholder="เช่น ชม.ละ 20 บาท, จอดฟรี 2 ชม.แรก"
                      className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                      />
                  </div>
`;
    
    // In edit page we might need to populate defaultValue
    if (filePath.includes('[id]')) {
        c = c.replace(
            /(<div className="grid grid-cols-1 md:grid-cols-2 gap-6">[\s\S]*?<\/select>\s*<\/div>)/,
            `$1
                  <div className="space-y-2 col-span-1 md:col-span-2 mock-field" style={{display: 'none'}}>
                      <label htmlFor="mockParkingFee" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      รายละเอียดค่าจอดรถ (แสดงบนแผนที่)
                      </label>
                      <input
                      type="text"
                      name="mockParkingFee"
                      id="mockParkingFee"
                      defaultValue={site.mock_parking_fee || ""}
                      placeholder="เช่น ชม.ละ 20 บาท, จอดฟรี 2 ชม.แรก"
                      className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                      />
                  </div>`
        );
    } else {
        c = c.replace(
            /(<div className="grid grid-cols-1 md:grid-cols-2 gap-6">[\s\S]*?<\/select>\s*<\/div>)/,
            `$1${mockField}`
        );
    }

    // Add script at the end of the form
    const script = `
                  <script dangerouslySetInnerHTML={{__html: \`
                    document.addEventListener('DOMContentLoaded', () => {
                      const typeSelect = document.getElementById('type');
                      const systemFields = document.querySelectorAll('.system-field');
                      const mockFields = document.querySelectorAll('.mock-field');
                      const updateFields = () => {
                        if (typeSelect.value === 'MOCK_PUBLIC') {
                          systemFields.forEach(el => el.style.display = 'none');
                          mockFields.forEach(el => el.style.display = 'block');
                        } else {
                          systemFields.forEach(el => el.style.display = 'block');
                          mockFields.forEach(el => el.style.display = 'none');
                        }
                      };
                      if (typeSelect) {
                        typeSelect.addEventListener('change', updateFields);
                        updateFields();
                      }
                    });
                  \`}} />
    `;
    c = c.replace(/(<\/form>)/, `${script}\n                $1`);

    fs.writeFileSync(filePath, c);
}

updateForm('c:/Toon/pssgo/app/sites/add/page.tsx');
updateForm('c:/Toon/pssgo/app/sites/[id]/page.tsx');
console.log('updated forms');
