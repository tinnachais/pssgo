const fs = require('fs');
let c = fs.readFileSync('c:/Toon/pssgo/app/actions/residents.ts', 'utf8');

c = c.replace(/return \{ success: true \};\n\s*\} catch \(e: any\) \{/g, `
        revalidatePath("/liff-users");
        return { success: true };
    } catch (e: any) {
`);

fs.writeFileSync('c:/Toon/pssgo/app/actions/residents.ts', c);
console.log('Fixed deleteLiffUserAndData revalidate');
