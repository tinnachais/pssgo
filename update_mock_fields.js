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

function replaceMockField(filePath, isEdit) {
    let c = fs.readFileSync(filePath, 'utf8');
    const regex = /<div className="space-y-2 col-span-1 md:col-span-2 mock-field" style=\{\{display: 'none'\}\}>[\s\S]*?<\/div>\s*<\/div>/;
    c = c.replace(regex, isEdit ? mockHtmlEdit : mockHtmlAdd);
    fs.writeFileSync(filePath, c);
    console.log("Updated mock fields in", filePath);
}

replaceMockField('c:/Toon/pssgo/app/sites/add/page.tsx', false);
replaceMockField('c:/Toon/pssgo/app/sites/[id]/page.tsx', true);
