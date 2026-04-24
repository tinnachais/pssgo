const fs = require('fs');

function insertCheckboxes(filePath, isEdit) {
    let c = fs.readFileSync(filePath, 'utf8');

    const appointmentHtml = `
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
                      </label>`;

    const visitorHtml = `
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
                      </label>`;

    if (c.includes('name="autoSetup"')) {
        c = c.replace(
            /(<div className="space-y-3 pt-2">)/,
            `$1\n${appointmentHtml}\n${visitorHtml}`
        );
    } else {
        c = c.replace(
            /(<div className="space-y-3 pt-2">)/,
            `$1\n${appointmentHtml}\n${visitorHtml}`
        );
    }
    
    fs.writeFileSync(filePath, c);
}

insertCheckboxes('c:/Toon/pssgo/app/sites/add/page.tsx', false);
insertCheckboxes('c:/Toon/pssgo/app/sites/[id]/page.tsx', true);

console.log('Restored checkboxes.');
