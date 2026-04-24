const fs = require('fs');

const mockHtmlAdd = `
                  <div className="col-span-1 md:col-span-2 space-y-4 mock-field" style={{display: 'none'}}>
                      <div className="bg-purple-50/50 dark:bg-purple-900/10 p-5 rounded-2xl border border-purple-100 dark:border-purple-800/50 mt-4">
                          <h3 className="text-sm font-bold text-purple-900 dark:text-purple-400 flex items-center gap-2 mb-4">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              ข้อมูลจำลองสำหรับแสดงบนแผนที่
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* รถยนต์ */}
                              <div className="space-y-4 bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                  <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                                      <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                      รถยนต์
                                  </h4>
                                  <div>
                                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">จำนวนช่องจอด</label>
                                      <input type="number" name="mockSlotsCar" placeholder="เช่น 50" className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 transition-all font-medium" />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">เวลาจอดฟรี</label>
                                      <input type="text" name="mockFreeTimeCar" placeholder="เช่น 2 ชม. แรก" className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 transition-all font-medium" />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">ค่าจอดรถ</label>
                                      <input type="text" name="mockFeeCar" placeholder="เช่น ชม.ละ 20 บาท" className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 transition-all font-medium" />
                                  </div>
                              </div>
                  
                              {/* รถจักรยานยนต์ */}
                              <div className="space-y-4 bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                  <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                                      <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                      รถจักรยานยนต์
                                  </h4>
                                  <div>
                                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">จำนวนช่องจอด</label>
                                      <input type="number" name="mockSlotsMotorcycle" placeholder="เช่น 20" className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 transition-all font-medium" />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">เวลาจอดฟรี</label>
                                      <input type="text" name="mockFreeTimeMotorcycle" placeholder="เช่น 30 นาทีแรก" className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 transition-all font-medium" />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">ค่าจอดรถ</label>
                                      <input type="text" name="mockFeeMotorcycle" placeholder="เช่น ชม.ละ 10 บาท" className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 transition-all font-medium" />
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>`;

const mockHtmlEdit = `
                  <div className="col-span-1 md:col-span-2 space-y-4 mock-field" style={{display: 'none'}}>
                      <div className="bg-purple-50/50 dark:bg-purple-900/10 p-5 rounded-2xl border border-purple-100 dark:border-purple-800/50 mt-4">
                          <h3 className="text-sm font-bold text-purple-900 dark:text-purple-400 flex items-center gap-2 mb-4">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              ข้อมูลจำลองสำหรับแสดงบนแผนที่
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* รถยนต์ */}
                              <div className="space-y-4 bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                  <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                                      <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                      รถยนต์
                                  </h4>
                                  <div>
                                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">จำนวนช่องจอด</label>
                                      <input type="number" name="mockSlotsCar" defaultValue={site.mock_slots_car || ""} placeholder="เช่น 50" className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 transition-all font-medium" />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">เวลาจอดฟรี</label>
                                      <input type="text" name="mockFreeTimeCar" defaultValue={site.mock_free_time_car || ""} placeholder="เช่น 2 ชม. แรก" className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 transition-all font-medium" />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">ค่าจอดรถ</label>
                                      <input type="text" name="mockFeeCar" defaultValue={site.mock_fee_car || ""} placeholder="เช่น ชม.ละ 20 บาท" className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 transition-all font-medium" />
                                  </div>
                              </div>
                  
                              {/* รถจักรยานยนต์ */}
                              <div className="space-y-4 bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                  <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                                      <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                      รถจักรยานยนต์
                                  </h4>
                                  <div>
                                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">จำนวนช่องจอด</label>
                                      <input type="number" name="mockSlotsMotorcycle" defaultValue={site.mock_slots_motorcycle || ""} placeholder="เช่น 20" className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 transition-all font-medium" />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">เวลาจอดฟรี</label>
                                      <input type="text" name="mockFreeTimeMotorcycle" defaultValue={site.mock_free_time_motorcycle || ""} placeholder="เช่น 30 นาทีแรก" className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 transition-all font-medium" />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">ค่าจอดรถ</label>
                                      <input type="text" name="mockFeeMotorcycle" defaultValue={site.mock_fee_motorcycle || ""} placeholder="เช่น ชม.ละ 10 บาท" className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 transition-all font-medium" />
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>`;

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
                const lastLine = out.pop();
                out.push(checkboxes);
                out.push(lastLine);
            }
        }

        if (hasCheckboxes && line.includes('space-y-4') && line.includes('bg-indigo-50/50') && line.includes('p-5')) {
            if (!line.includes('system-field')) {
                line = line.replace('className="space-y-4', 'className="space-y-4 system-field');
            }
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

        // 6. Add detailed mock field
        if (line.includes('</select>') && lines[i+1] && lines[i+1].includes('</div>')) {
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
                out.push(isEdit ? mockHtmlEdit : mockHtmlAdd);
            }
        }
        
        // 7. Add SiteTypeLogic before form closes
        if (line.includes('</form>')) {
            out.pop();
            out.push('                <SiteTypeLogic />');
            out.push('            </form>');
        }
    }

    fs.writeFileSync(filePath, out.join('\n'));
}

processFile('c:/Toon/pssgo/app/sites/add/page.tsx', false);
processFile('c:/Toon/pssgo/app/sites/[id]/page.tsx', true);

console.log('Done flawless build V2');
