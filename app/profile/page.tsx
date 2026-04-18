import { cookies } from "next/headers";
import { getUser } from "@/app/actions/users";
import ProfileClient from "./ProfileClient";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const cookieStore = await cookies();
    const sessionData = cookieStore.get("pssgo_session")?.value;
    
    if (!sessionData) {
        redirect("/login");
    }

    const decoded = JSON.parse(Buffer.from(sessionData, 'base64').toString('utf8'));
    const userId = Number(decoded.userId);

    if (isNaN(userId)) {
        // Handle admin (non-numeric id) case if necessary, 
        // but typically admin also has a profile or we use a separate path.
        // For now, if "admin" string, we might not have a database user.
        if (decoded.userId === "admin") {
             return (
                 <div className="p-10 text-center">
                    <h1 className="text-2xl font-bold">Admin Profile</h1>
                    <p className="text-zinc-500 mt-2">บัญชีแอดมินกลาง (Super Admin) ไม่สามารถแก้ไขผ่านหน้านี้ได้</p>
                 </div>
             );
        }
        redirect("/login");
    }

    const user = await getUser(userId);
    if (!user) {
        redirect("/login");
    }

    return <ProfileClient user={user} />;
}
