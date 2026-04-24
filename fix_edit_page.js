const fs = require('fs');

let c = fs.readFileSync('c:/Toon/pssgo/app/sites/[id]/page.tsx', 'utf8');

// 1. Add MOCK_PUBLIC option
c = c.replace(
    /<option value="PUBLIC">[^<]*<\/option>/,
    `$&
                              <option value="MOCK_PUBLIC">สาธารณะจำลอง (พิกัด, จำนวนช่องจอด, ค่าจอด)</option>`
);

// 2. Add system-field to packageId wrapper
c = c.replace(
    /(<div className="space-y-2)([^"]*)(">\s*<label htmlFor="packageId")/,
    `$1 system-field$2$3`
);

// 3. Add system-field to contactLink wrapper
c = c.replace(
    /(<div className="space-y-2)([^"]*)(">\s*<label htmlFor="contactLink")/,
    `$1 system-field$2$3`
);

// 4. Add mockParkingFee input right after type select div closes
c = c.replace(
    /(<select\s+name="type"[\s\S]*?<\/select>\s*<\/div>)/,
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

// 5. Add checkboxes BEFORE contactLink
const checkboxes = `
                <div className="space-y-4 bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 mt-6 system-field">
                  <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-400 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      การตั้งค่าระบบและฟีเจอร์เพิ่มเติม
                  </h3>
                  <div className="space-y-3 pt-2">
                      <label className="relative flex items-start gap-3 cursor-pointer group">
                          <div className="flex items-center h-6">
                              <input
                                  type="checkbox"
                                  name="enableAppointments"
                                  defaultChecked={site.enable_appointments !== false}
                                  className="w-5 h-5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 transition-all cursor-pointer"
                              />
                          </div>
                          <div className="flex flex-col">
                              <span className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">เปิดใช้งานระบบนัดหมายล่วงหน้า (Appointments)</span>
                              <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">อนุญาตให้ลูกบ้านสร้างคิวอาร์โค้ดเพื่อนัดหมายผู้มาติดต่อล่วงหน้าผ่าน LINE</span>
                          </div>
                      </label>
                      <label className="relative flex items-start gap-3 cursor-pointer group">
                          <div className="flex items-center h-6">
                              <input
                                  type="checkbox"
                                  name="enableVisitorIdExchange"
                                  defaultChecked={site.enable_visitor_id_exchange !== false}
                                  className="w-5 h-5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 transition-all cursor-pointer"
                              />
                          </div>
                          <div className="flex flex-col">
                              <span className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">เปิดใช้งานการแลกบัตรผู้มาติดต่อ (Visitor ID Exchange)</span>
                              <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">บังคับให้ต้องเสียบบัตรประชาชนเพื่ออ่านข้อมูลด้วยเครื่องอ่านบัตร (Smart Card Reader) สำหรับผู้มาติดต่อที่ไม่ได้นัดหมาย</span>
                          </div>
                      </label>
                  </div>
                </div>
`;
c = c.replace(
    /(<div className="space-y-2[ ]*system-field">\s*<label htmlFor="contactLink")/,
    `${checkboxes}\n                $1`
);

// 6. Add Javascript logic
const script = `
                  <script dangerouslySetInnerHTML={{__html: \`
                    document.addEventListener('DOMContentLoaded', () => {
                      const typeSelect = document.getElementById('type');
                      const updateFields = () => {
                        const systemFields = document.querySelectorAll('.system-field');
                        const mockFields = document.querySelectorAll('.mock-field');
                        if (typeSelect && typeSelect.value === 'MOCK_PUBLIC') {
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
                  \`}} />`;

c = c.replace(/(<\/form>)/, `${script}\n            $1`);

fs.writeFileSync('c:/Toon/pssgo/app/sites/[id]/page.tsx', c);
console.log('done fixing edit page');
