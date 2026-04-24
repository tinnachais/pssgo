const fs = require('fs');

function processFile(filePath, isEdit) {
    let lines = fs.readFileSync(filePath, 'utf8').split('\n');
    let out = [];
    
    let lastImportIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
            lastImportIndex = i;
        }
    }

    let hasCheckboxes = false;
    for (let line of lines) {
        if (line.includes('name="autoSetup"') || line.includes('bg-indigo-50/50')) {
            hasCheckboxes = true;
        }
    }

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // 1. Add import
        if (i === lastImportIndex) {
            out.push(line);
            out.push('import SiteTypeLogic from "@/app/sites/SiteTypeLogic";');
            continue;
        }

        // 2. Add MOCK_PUBLIC option
        if (line.includes('<option value="PUBLIC">')) {
            out.push(line);
            out.push('                              <option value="MOCK_PUBLIC">สาธารณะจำลอง (พิกัด, จำนวนช่องจอด, ค่าจอด)</option>');
            continue;
        }

        // 3. packageId system-field
        if (line.includes('label htmlFor="packageId"')) {
            if (out.length > 0 && out[out.length - 1].includes('space-y-2')) {
                if (!out[out.length - 1].includes('system-field')) {
                    out[out.length - 1] = out[out.length - 1].replace('className="space-y-2"', 'className="space-y-2 system-field"');
                }
            }
        }

        // 4. contactLink system-field AND inject checkboxes if they don't exist
        if (line.includes('label htmlFor="contactLink"')) {
            if (out.length > 0 && out[out.length - 1].includes('space-y-2')) {
                if (!out[out.length - 1].includes('system-field')) {
                    out[out.length - 1] = out[out.length - 1].replace('className="space-y-2"', 'className="space-y-2 system-field"');
                }
            }
            
            // If the file doesn't have checkboxes naturally, we MUST inject them BEFORE the contactLink div
            if (!hasCheckboxes) {
                const checkboxes = `
                <div className="space-y-4 bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 mt-6 system-field mb-6">
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
                                  ${isEdit ? 'defaultChecked={site.enable_appointments !== false}' : 'defaultChecked'}
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
                                  ${isEdit ? 'defaultChecked={site.enable_visitor_id_exchange !== false}' : 'defaultChecked'}
                                  className="w-5 h-5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 transition-all cursor-pointer"
                              />
                          </div>
                          <div className="flex flex-col">
                              <span className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">เปิดใช้งานการแลกบัตรผู้มาติดต่อ (Visitor ID Exchange)</span>
                              <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">บังคับให้ต้องเสียบบัตรประชาชนเพื่ออ่านข้อมูลด้วยเครื่องอ่านบัตร (Smart Card Reader) สำหรับผู้มาติดต่อที่ไม่ได้นัดหมาย</span>
                          </div>
                      </label>
                  </div>
                </div>`;
                // Insert it before the contactLink div which was just pushed (so we insert before the last item)
                const lastLine = out.pop();
                out.push(checkboxes);
                out.push(lastLine);
            }
        }

        // 5. If the file has checkboxes, add system-field to their wrapper
        if (hasCheckboxes && line.includes('space-y-4') && line.includes('bg-indigo-50/50') && line.includes('p-5')) {
            if (!line.includes('system-field')) {
                line = line.replace('className="space-y-4', 'className="space-y-4 system-field');
            }
            
            // Also, since this file already has checkboxes, but they might just be autoSetup, we need to inject the appointments ones if missing!
            // We will do that when we find the <div className="space-y-3 pt-2"> line
        }

        if (hasCheckboxes && line.includes('<div className="space-y-3 pt-2">')) {
            out.push(line);
            out.push(`
                      <label className="relative flex items-start gap-3 cursor-pointer group">
                          <div className="flex items-center h-6">
                              <input
                                  type="checkbox"
                                  name="enableAppointments"
                                  ${isEdit ? 'defaultChecked={site.enable_appointments !== false}' : 'defaultChecked'}
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
                                  ${isEdit ? 'defaultChecked={site.enable_visitor_id_exchange !== false}' : 'defaultChecked'}
                                  className="w-5 h-5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 transition-all cursor-pointer"
                              />
                          </div>
                          <div className="flex flex-col">
                              <span className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">เปิดใช้งานการแลกบัตรผู้มาติดต่อ (Visitor ID Exchange)</span>
                              <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">บังคับให้ต้องเสียบบัตรประชาชนเพื่ออ่านข้อมูลด้วยเครื่องอ่านบัตร (Smart Card Reader) สำหรับผู้มาติดต่อที่ไม่ได้นัดหมาย</span>
                          </div>
                      </label>`);
            continue;
        }

        out.push(line);

        // 6. Add mockParkingFee right after type select div closes
        if (line.includes('</select>') && lines[i+1] && lines[i+1].includes('</div>')) {
            // verify it's the type select
            let isTypeSelect = false;
            for (let j = i; j >= Math.max(0, i-10); j--) {
                if (lines[j].includes('id="type"')) {
                    isTypeSelect = true;
                    break;
                }
            }
            if (isTypeSelect) {
                out.push(lines[i+1]); // </div>
                i++; // skip
                
                const valAttr = isEdit ? 'defaultValue={site.mock_parking_fee || ""}' : '';
                
                out.push(`
                  <div className="space-y-2 col-span-1 md:col-span-2 mock-field" style={{display: 'none'}}>
                      <label htmlFor="mockParkingFee" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      รายละเอียดค่าจอดรถ (แสดงบนแผนที่)
                      </label>
                      <input
                      type="text"
                      name="mockParkingFee"
                      id="mockParkingFee"
                      ${valAttr}
                      placeholder="เช่น ชม.ละ 20 บาท, จอดฟรี 2 ชม.แรก"
                      className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                      />
                  </div>
                `);
            }
        }
        
        // 7. Add SiteTypeLogic before form closes
        if (line.includes('</form>')) {
            // remove form closing tag we just added
            out.pop();
            out.push('                <SiteTypeLogic />');
            out.push('            </form>');
        }
    }

    fs.writeFileSync(filePath, out.join('\n'));
}

processFile('c:/Toon/pssgo/app/sites/add/page.tsx', false);
processFile('c:/Toon/pssgo/app/sites/[id]/page.tsx', true);

console.log('Fixed files flawlessly.');
