const fs = require('fs');

function processFile(filePath, isEdit) {
    let lines = fs.readFileSync(filePath, 'utf8').split('\n');
    let out = [];
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Add option to type select
        if (line.includes('<option value="PUBLIC">')) {
            out.push(line);
            out.push('                              <option value="MOCK_PUBLIC">สาธารณะจำลอง (พิกัด, จำนวนช่องจอด, ค่าจอด)</option>');
            continue;
        }

        // Add .system-field to packageId wrapper
        if (line.includes('label htmlFor="packageId"')) {
            // we need to go back one line and add system-field
            if (out.length > 0 && out[out.length - 1].includes('space-y-2')) {
                out[out.length - 1] = out[out.length - 1].replace('className="space-y-2"', 'className="space-y-2 system-field"');
            }
        }

        // Add .system-field to contactLink wrapper
        if (line.includes('label htmlFor="contactLink"')) {
            // we need to go back one line and add system-field
            if (out.length > 0 && out[out.length - 1].includes('space-y-2')) {
                out[out.length - 1] = out[out.length - 1].replace('className="space-y-2"', 'className="space-y-2 system-field"');
            }
        }
        
        // Add .system-field to checkboxes wrapper
        if (line.includes('space-y-4') && line.includes('bg-indigo-50/50') && line.includes('p-5')) {
            line = line.replace('className="space-y-4', 'className="space-y-4 system-field');
        }

        out.push(line);
        
        // Add mockParkingFee input right after type select closes
        if (line.includes('</select>') && lines[i+1] && lines[i+1].includes('</div>')) {
            // this could be any select, but we only want the type select
            // let's check previous lines for id="type"
            let isTypeSelect = false;
            for (let j = i; j >= Math.max(0, i-10); j--) {
                if (lines[j].includes('id="type"')) {
                    isTypeSelect = true;
                    break;
                }
            }
            if (isTypeSelect) {
                out.push(lines[i+1]); // </div>
                i++; // skip next line
                
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
        
        // Add script before </form>
        if (line.includes('</form>')) {
            out.splice(out.length - 1, 0, `
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
                  \`}} />
            `);
        }
    }
    
    fs.writeFileSync(filePath, out.join('\n'));
}

processFile('c:/Toon/pssgo/app/sites/add/page.tsx', false);
processFile('c:/Toon/pssgo/app/sites/[id]/page.tsx', true);

console.log('Processed both files carefully.');
