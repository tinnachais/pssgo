"use client";

import { useLiff } from "@/app/components/LiffProvider";
import { useState, useEffect } from "react";
import { linkLineAccount, analyzeCarImage, getLiffProfileData, generateFamilyInvite, revokeFamilyMember, updateLiffProfile, deleteLiffVehicle, togglePrivacyMode, getResidentAccessLogs, eStampVisitor } from "@/app/actions/liff";
import { getResidentAppointments, createVisitorInvite, cancelVisitorInvite } from "@/app/actions/visitors";
import { getLiffNews, markNewsAsRead } from "@/app/actions/news";
import logoPic from "@/public/logo.png";

export default function LiffProfilePage() {
  const { profile, liffObject } = useLiff();
  const [inviteCode, setInviteCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // สถานะตรวจสอบข้อมูลผู้เช่า/ร้าน/บริษัทที่มีอยู่แล้ว
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [showAddCarForm, setShowAddCarForm] = useState(false);
  
  // สถานะข้อมูลรถ (กรอกเอง หรือให้ AI เติมให้)
  const [detectedPlate, setDetectedPlate] = useState("");
  const [detectedProvince, setDetectedProvince] = useState("");
  const [detectedColor, setDetectedColor] = useState("");
  const [detectedType, setDetectedType] = useState("รถยนต์");
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [result, setResult] = useState<{success: boolean, message: string, data?: any} | null>(null);

  // การแก้ไขโปรไฟล์
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editOwnerName, setEditOwnerName] = useState("");
  const [editPhoneNumber, setEditPhoneNumber] = useState("");
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [view, setView] = useState<'menu' | 'profile' | 'family' | 'appointment' | 'access' | 'news'>('menu');
  const [newMemberName, setNewMemberName] = useState("");
  const [familyResult, setFamilyResult] = useState<{success: boolean, message: string, inviteCode?: string} | null>(null);

  const [apptViewMode, setApptViewMode] = useState<'LIST' | 'CREATE'>('LIST');
  const [apptFilter, setApptFilter] = useState<'ALL' | 'APPOINTMENT' | 'WALKIN'>('ALL');
  const [apptList, setApptList] = useState<any[]>([]);
  const [expandedApptId, setExpandedApptId] = useState<number | null>(null);
  const [apptMonth, setApptMonth] = useState(new Date().getMonth() + 1);
  const [apptYear, setApptYear] = useState(new Date().getFullYear());

  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isLoadingAppts, setIsLoadingAppts] = useState(false);

  const [newsList, setNewsList] = useState<any[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);

  const [apptName, setApptName] = useState("");
  const [apptType, setApptType] = useState<"ONCE" | "RANGE">("ONCE");
  const [apptStart, setApptStart] = useState("");
  const [apptEnd, setApptEnd] = useState("");
  const [apptPurpose, setApptPurpose] = useState("");
  const [apptToken, setApptToken] = useState("");
  const [isApptLinkReady, setIsApptLinkReady] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // โหลดค่าเดิมจาก LocalStorage เมื่อเปิดแอป
  useEffect(() => {
    try {
        const savedView = localStorage.getItem('pssgo_liff_view') as any;
        if (savedView === 'menu' || savedView === 'profile' || savedView === 'family' || savedView === 'appointment' || savedView === 'access' || savedView === 'news') {
            setView(savedView);
        }
        
        const savedApptFilter = localStorage.getItem('pssgo_liff_appt_filter') as any;
        if (savedApptFilter === 'ALL' || savedApptFilter === 'APPOINTMENT' || savedApptFilter === 'WALKIN') {
            setApptFilter(savedApptFilter);
        }
        
        const savedApptView = localStorage.getItem('pssgo_liff_appt_view') as any;
        if (savedApptView === 'LIST' || savedApptView === 'CREATE') {
            setApptViewMode(savedApptView);
        }

        const urlParams = new URLSearchParams(window.location.search);
        let urlCode = urlParams.get('inviteCode');
        
        if (!urlCode && urlParams.get('liff.state')) {
            // LIFF sometimes passes params in liff.state after auth redirect
            const stateParams = new URLSearchParams(urlParams.get('liff.state')?.replace(/^\?/, '') || '');
            urlCode = stateParams.get('inviteCode');
        }
        
        if (urlCode) {
            setInviteCode(urlCode);
            localStorage.setItem('pssgo_liff_invite_code', urlCode);
            setView('profile');
        } else {
            const savedCode = localStorage.getItem('pssgo_liff_invite_code');
            if (savedCode) setInviteCode(savedCode);
        }
        const savedProv = localStorage.getItem('pssgo_liff_province');
        if (savedProv) setDetectedProvince(savedProv);
    } catch (e) {}
    setIsInitialized(true);
  }, []);

  // บันทึกค่าลง LocalStorage เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
      if (!isInitialized) return;
      localStorage.setItem('pssgo_liff_view', view);
      if (view === 'access') {
          loadAccessLogs();
      }
      if (view === 'news') {
          loadNews();
      }
  }, [view, isInitialized]);

  useEffect(() => {
      if (!isInitialized) return;
      localStorage.setItem('pssgo_liff_appt_filter', apptFilter);
  }, [apptFilter, isInitialized]);

  useEffect(() => {
      if (!isInitialized) return;
      localStorage.setItem('pssgo_liff_appt_view', apptViewMode);
  }, [apptViewMode, isInitialized]);

  useEffect(() => {
      localStorage.setItem('pssgo_liff_invite_code', inviteCode);
  }, [inviteCode]);

  useEffect(() => {
      if (detectedProvince && detectedProvince !== "N/A") {
          localStorage.setItem('pssgo_liff_province', detectedProvince);
      }
  }, [detectedProvince]);

  useEffect(() => {
      async function checkProfile() {
          if (profile?.userId) {
              const data = await getLiffProfileData(profile.userId);
              setProfileData(data);
              if (data?.resident) {
                  setEditOwnerName(data.resident.owner_name || data.resident.line_display_name || "");
                  setEditPhoneNumber(data.resident.phone_number || "");
                  setIsPrivacyMode(data.resident.privacy_mode || false);
              }
              if (!data?.isRegistered) {
                  setView('profile');
              }
              setIsCheckingProfile(false);
          }
      }
      checkProfile();
  }, [profile?.userId]);

  const loadAppts = async () => {
      if (profileData?.resident?.id) {
          setIsLoadingAppts(true);
          const data = await getResidentAppointments(profileData.resident.id, apptYear, apptMonth);
          setApptList(data || []);
          setIsLoadingAppts(false);
      }
  };

  const loadAccessLogs = async () => {
      if (!profileData?.resident?.house_number) return;
      setIsLoadingLogs(true);
      const logs = await getResidentAccessLogs(profileData.resident.house_number);
      setAccessLogs(logs || []);
      setIsLoadingLogs(false);
  };

  const loadNews = async () => {
      if (!profileData?.resident?.id || !profileData?.resident?.site_id) return;
      setIsLoadingNews(true);
      const news = await getLiffNews(profileData.resident.id, profileData.resident.site_id);
      setNewsList(news || []);
      setIsLoadingNews(false);
  };

  useEffect(() => {
      loadAppts();
      loadAccessLogs();
      loadNews();
  }, [apptMonth, apptYear, profileData?.resident?.id]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const originalFile = e.target.files[0];
      setIsAnalyzing(true);
      setResult(null);

      try {
        // ย่อรูปภาพก่อนส่ง ป้องกันโควต้า Server Action เกิน 1MB ของ Next.js
        const compressedFile = await new Promise<File>((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(originalFile);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const MAX_WIDTH = 1000;
                    const MAX_HEIGHT = 1000;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);
                    
                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(new File([blob], "compressed_" + originalFile.name, { type: "image/jpeg" }));
                        } else {
                            resolve(originalFile);
                        }
                    }, "image/jpeg", 0.7);
                };
            };
        });

        const formData = new FormData();
        formData.append("image", compressedFile);
        setImageFile(compressedFile); // เก็บรูปภาพไว้สําหรับส่งเข้าระบบเสมอ
        
        const res = await analyzeCarImage(formData);
        
        if (res.success && res.data) {
            setDetectedPlate(res.data.licensePlate || "");
            setDetectedProvince(res.data.province || "");
            setDetectedColor(res.data.color || "");
            setDetectedType(res.data.type || "รถยนต์");
        }
      } catch (err: any) {
        console.error("Compression/Upload Error:", err);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.userId) {
        alert("ไม่พบข้อมูล LINE ID กรุณาเปิดผ่านแอป LINE");
        return;
    }

    setIsSubmitting(true);
    setResult(null);
    
    // เตรียมข้อมูลส่งผ่าน FormData 
    const formData = new FormData();
    if (profileData?.isRegistered && profileData.resident?.invite_code) {
        formData.append("inviteCode", profileData.resident.invite_code);
    } else {
        formData.append("inviteCode", inviteCode.trim());
    }
    
    formData.append("lineUserId", profile.userId);
    formData.append("displayName", profile.displayName || "");
    formData.append("pictureUrl", profile.pictureUrl || "");
    if (detectedPlate) {
        formData.append("detectedPlate", detectedPlate);
        formData.append("detectedProvince", detectedProvince || "N/A");
        formData.append("detectedColor", detectedColor || "N/A");
        formData.append("detectedType", detectedType || "");
    }
    
    if (imageFile) {
        formData.append("image", imageFile);
    }

    if (!profileData?.isRegistered) {
        if (editOwnerName) formData.append("ownerName", editOwnerName.trim());
        if (editPhoneNumber) formData.append("phoneNumber", editPhoneNumber.trim());
    }

    // เรียกใช้งาน Server Action เพื่อผูกบัญชีและอัปเดตลงตารางย่อย
    const res = await linkLineAccount(formData);

    setResult(res);
    setIsSubmitting(false);

    // หากผูกบัญชีสำเร็จ หรือมี error เกี่ยวกับโควต้ารถ (แปลว่าผูกบัญชีไปแล้ว)
    const isPartialSuccess = !res.success && res.accountLinked;

    if (res.success || isPartialSuccess) {
        if (profileData?.isRegistered) {
            // ถ้าเป็นการเพิ่มรถ ให้ซ่อนฟอร์มเมื่อสำเร็จ
            if (res.success) setShowAddCarForm(false);
            
            setDetectedPlate("");
            setDetectedProvince("");
            setDetectedColor("");
            setImageFile(null);
            
            const newData = await getLiffProfileData(profile.userId);
            setProfileData(newData);
            setTimeout(() => setResult(null), res.success ? 3000 : 5000);
        } else {
            // ถ้าเป็นการลงทะเบียนใหม่ ให้โหลดโปรไฟล์ใหม่
            setTimeout(async () => {
                const newData = await getLiffProfileData(profile.userId);
                setProfileData(newData);
                if (res.success) setResult(null);
            }, 2000);
        }
    }
  };

  const handleInviteFamily = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!profileData?.resident?.id) return;
      if (!newMemberName) return;

      setIsSubmitting(true);
      const res = await generateFamilyInvite(profileData.resident.id, newMemberName);
      setFamilyResult(res);
      setIsSubmitting(false);

      if (res.success) {
          setNewMemberName("");
          // Refetch profile data to update family members
          const newData = await getLiffProfileData(profile.userId!);
          setProfileData(newData);
      }
  };

  const handleRevokeFamily = async (memberId: number) => {
      if (!confirm("ยืนยันการยกเลิกสิทธิ์ผู้เช่า/ร้าน/บริษัทรายนี้?")) return;
      
      const res = await revokeFamilyMember(memberId, profileData.resident.id);
      if (res.success) {
          // Refetch profile data
          const newData = await getLiffProfileData(profile.userId!);
          setProfileData(newData);
          setFamilyResult({ success: true, message: "ยกเลิกสิทธิ์สำเร็จ" });
          setTimeout(() => setFamilyResult(null), 3000);
      } else {
          setFamilyResult(res);
      }
  };

  const handleShareAppointment = async (type: 'line' | 'email') => {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://pssgo.com';
      const params = new URLSearchParams();
      if (profileData?.resident?.id) params.append('ref', profileData.resident.id.toString());
      if (apptName) params.append('n', apptName);
      if (apptStart) params.append('s', apptStart);
      if (apptPurpose) params.append('p', apptPurpose);

      const link = `${origin}/visitor/preregister?${params.toString()}`;
      
      let mapUrl = "";
      if (profileData?.resident?.site_lat && profileData?.resident?.site_lng) {
          mapUrl = `https://maps.google.com/?q=${profileData.resident.site_lat},${profileData.resident.site_lng}`;
      } else if (profileData?.resident?.site_name) {
          mapUrl = `https://maps.google.com/?q=${encodeURIComponent(profileData.resident.site_name)}`;
      }

      let mapLinkText = "";
      if (mapUrl) {
          if (profileData?.resident?.site_lat && profileData?.resident?.site_lng) {
              mapLinkText = `\n\n📍 พิกัดที่ตั้งสถานที่ (${profileData.resident.site_lat}, ${profileData.resident.site_lng}):\n${mapUrl}`;
          } else {
              mapLinkText = `\n\n📍 พิกัดที่ตั้งสถานที่:\n${mapUrl}`;
          }
      }

      const messageText = `คุณได้รับคำเชิญการมาเยือนที่ ${profileData?.resident?.site_name || 'สถานที่'} (สถานที่/ห้อง ${profileData?.resident?.house_number})\nสำหรับ: ${apptName}${mapLinkText}\n\nกรุณากรอกข้อมูลเพื่อความสะดวกรวดเร็วในการเข้าสถานที่ที่ลิงก์นี้:\n${link}`;

      const footerContents: any[] = [
          {
          "type": "button",
          "action": {
              "type": "uri",
              "label": "📝 ลงทะเบียนล่วงหน้า",
              "uri": link
          },
          "style": "primary",
          "color": "#06C755"
          }
      ];

      if (mapUrl) {
          footerContents.push({
          "type": "button",
          "action": {
              "type": "uri",
              "label": "📍 แผนที่สถานที่",
              "uri": mapUrl
          },
          "style": "secondary",
          "margin": "sm"
          });
      }

      if (type === 'line') {
          if (liffObject?.isApiAvailable('shareTargetPicker')) {
              try {
                  await liffObject.shareTargetPicker([
                      {
                        "type": "flex",
                        "altText": `คำเชิญการมาเยือน ${profileData?.resident?.site_name || 'สถานที่'}`,
                        "contents": {
                            "type": "bubble",
                            "size": "mega",
                            "header": {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                "type": "text",
                                "text": "🎫 คำเชิญเข้าพื้นที่สถานที่",
                                "weight": "bold",
                                "color": "#ffffff",
                                "size": "md"
                                }
                            ],
                            "backgroundColor": "#06C755"
                            },
                            "body": {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                "type": "text",
                                "text": profileData?.resident?.site_name || 'หมู่บ้าน/สถานที่',
                                "weight": "bold",
                                "size": "xl",
                                "wrap": true
                                },
                                {
                                "type": "box",
                                "layout": "baseline",
                                "margin": "md",
                                "contents": [
                                    {
                                    "type": "text",
                                    "text": "ติดต่อบ้าน:",
                                    "color": "#aaaaaa",
                                    "size": "sm",
                                    "flex": 2
                                    },
                                    {
                                    "type": "text",
                                    "text": profileData?.resident?.house_number || '-',
                                    "wrap": true,
                                    "color": "#666666",
                                    "size": "sm",
                                    "flex": 4,
                                    "weight": "bold"
                                    }
                                ]
                                },
                                {
                                "type": "box",
                                "layout": "baseline",
                                "margin": "sm",
                                "contents": [
                                    {
                                    "type": "text",
                                    "text": "ชื่อผู้มาติดต่อ:",
                                    "color": "#aaaaaa",
                                    "size": "sm",
                                    "flex": 2
                                    },
                                    {
                                    "type": "text",
                                    "text": apptName || '-',
                                    "wrap": true,
                                    "color": "#666666",
                                    "size": "sm",
                                    "flex": 4,
                                    "weight": "bold"
                                    }
                                ]
                                },
                                {
                                "type": "box",
                                "layout": "baseline",
                                "margin": "sm",
                                "contents": [
                                    {
                                    "type": "text",
                                    "text": "วันที่มาติดต่อ:",
                                    "color": "#aaaaaa",
                                    "size": "sm",
                                    "flex": 2
                                    },
                                    {
                                    "type": "text",
                                    "text": apptStart || '-',
                                    "wrap": true,
                                    "color": "#666666",
                                    "size": "sm",
                                    "flex": 4,
                                    "weight": "bold"
                                    }
                                ]
                                },
                                {
                                "type": "box",
                                "layout": "baseline",
                                "margin": "sm",
                                "contents": [
                                    {
                                    "type": "text",
                                    "text": "ติดต่อเรื่อง:",
                                    "color": "#aaaaaa",
                                    "size": "sm",
                                    "flex": 2
                                    },
                                    {
                                    "type": "text",
                                    "text": apptPurpose || '-',
                                    "wrap": true,
                                    "color": "#666666",
                                    "size": "sm",
                                    "flex": 4,
                                    "weight": "bold"
                                    }
                                ]
                                },
                                {
                                "type": "text",
                                "text": "กรุณาลงทะเบียนข้อมูลรถยนต์ล่วงหน้า เพื่อความรวดเร็วในการแลกบัตรเข้าพื้นที่สถานที่",
                                "wrap": true,
                                "color": "#aaaaaa",
                                "size": "xs",
                                "margin": "xl"
                                }
                            ]
                            },
                            "footer": {
                            "type": "box",
                            "layout": "vertical",
                            "contents": footerContents
                            }
                        }
                      }
                  ]);
                  // success
              } catch (e:any) {
                  console.log("Share failed or canceled", e);
                  window.location.href = `https://line.me/R/msg/text/?${encodeURIComponent(messageText)}`;
              }
          } else {
              window.location.href = `https://line.me/R/msg/text/?${encodeURIComponent(messageText)}`;
          }

      } else if (type === 'email') {
          const subject = encodeURIComponent(`คำเชิญการมาเยือน ${profileData?.resident?.site_name || 'สถานที่'}`);
          const body = encodeURIComponent(messageText);
          window.location.href = `mailto:?subject=${subject}&body=${body}`;
      }
  };

  if (isCheckingProfile && profile?.userId) {
      return (
          <div className="min-h-screen bg-[#F4F4F4] flex flex-col items-center justify-center">
              <svg className="animate-spin w-12 h-12 text-[#06C755] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-slate-500 font-bold">กำลังโหลดข้อมูลของคุณ...</p>
              <p className="text-center text-xs text-slate-400 mt-6 pb-6 w-full absolute bottom-4">PSS GO &copy; Powered by PSS</p>
          </div>
      );
  }

  // --- Validate Expiration ---
  if (profileData?.isExpired) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-rose-100 text-center max-w-sm">
                  <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-5">
                      <svg className="w-10 h-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                  </div>
                  <h2 className="text-xl font-black text-slate-800 mb-2">ระงับการให้บริการชั่วคราว</h2>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto mb-8">
                      ระบบสถานที่ของท่านยังไม่พร้อมใช้งาน หรือหมดอายุการใช้งานแล้ว กรุณาติดต่อนิติบุคคลเพื่อดำเนินการต่ออายุครับ
                  </p>
                  {profileData?.resident?.site_contact_link && (
                      <a href={profileData.resident.site_contact_link} className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 transition-colors font-bold py-3.5 px-4 rounded-xl text-white shadow-md shadow-indigo-600/20">
                          ติดต่อเจ้าหน้าที่
                      </a>
                  )}
              </div>
          </div>
      );
  }

  // --- iOS Style Home Menu View ---
  if (view === 'menu') {
      if (profileData && !profileData.isRegistered) {
          // If state hasn't updated yet, don't render menu
          return null; 
      }
      const activeApptCount = apptList.filter((a: any) => ['INVITED', 'PRE', 'IN'].includes(a.status) && a.invite_token).length;
      const walkinApptCount = apptList.filter((a: any) => ['PRE', 'IN'].includes(a.status) && !a.invite_token).length;

      return (
          <div className="min-h-screen bg-gradient-to-br from-[#EAEFF4] to-[#FFFFFF] text-slate-800 p-4 font-sans flex flex-col items-center overflow-y-auto pb-10">
              <div className="flex flex-col items-center mt-6 mb-8 w-full animate-in fade-in zoom-in duration-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-lg shadow-black/5 bg-white border border-slate-100">
                      <img src={logoPic.src} alt="PSS GO Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="font-extrabold text-xl tracking-tight text-slate-800">PSS GO</span>
                  </div>
                  <img src={profile?.pictureUrl || "https://via.placeholder.com/150"} alt="Profile" className="w-[88px] h-[88px] rounded-full border-4 border-white shadow-md mb-3 object-cover" />
                  <h1 className="text-xl font-bold text-slate-800 tracking-tight">สวัสดี, {profile?.displayName || 'ผู้เช่า/ร้าน/บริษัท'}</h1>
                  {profileData?.isRegistered && profileData?.resident && (
                      <div className="mt-1 flex flex-col items-center">
                          <p className="text-sm font-bold text-[#06C755]">{profileData.resident.site_name || 'ไม่ระบุสถานที่'}</p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">สถานที่/ห้อง {profileData.resident.house_number}</p>
                      </div>
                  )}
              </div>

              {/* iOS Grid Container - 4 Columns x 5 Rows */}
              <div className="grid grid-cols-4 gap-x-3 gap-y-7 w-full max-w-[380px] px-1">
                  {/* Icon 1: Profile & Cars */}
                  <div className="flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95" onClick={() => setView('profile')}>
                      <div className="w-[76px] h-[76px] rounded-[18px] bg-gradient-to-b from-[#06C755] to-[#04a044] shadow-md flex items-center justify-center ring-1 ring-black/5">
                          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                      </div>
                      <span className="text-[12px] font-bold text-slate-800 text-center leading-tight tracking-tight">โปรไฟล์</span>
                  </div>

                  {/* Icon 2: Appointments */}
                  <div className="flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95" onClick={() => { setView('appointment'); setApptFilter('APPOINTMENT'); }}>
                      <div className="w-[76px] h-[76px] rounded-[18px] bg-gradient-to-b from-[#3b82f6] to-[#2563eb] shadow-md flex items-center justify-center relative ring-1 ring-black/5">
                          {activeApptCount > 0 && (
                              <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center bg-red-500 text-white text-[10px] font-black h-5 min-w-[20px] px-1.5 rounded-full border-2 border-white shadow-sm z-10">{activeApptCount}</div>
                          )}
                          <svg className="w-10 h-10 text-white/95" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                      </div>
                      <span className="text-[12px] font-semibold text-slate-700 text-center leading-tight tracking-tight">นัดหมาย</span>
                  </div>


                  {/* Icon 3: Access Logs */}
                  <div className="flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95" onClick={() => setView('access')}>
                      <div className="w-[76px] h-[76px] rounded-[18px] bg-gradient-to-b from-[#14b8a6] to-[#0f766e] shadow-md flex items-center justify-center relative ring-1 ring-black/5">
                          <svg className="w-10 h-10 text-white/95" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 18h16" />
                          </svg>
                      </div>
                      <span className="text-[12px] font-semibold text-slate-700 text-center leading-tight tracking-tight">ประวัติเข้าออก</span>
                  </div>

                  {/* Icon 4: Notice */}
                  <div className="flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95" onClick={() => setView('news')}>
                      <div className="w-[76px] h-[76px] rounded-[18px] bg-gradient-to-b from-[#f59e0b] to-[#d97706] shadow-md flex items-center justify-center relative ring-1 ring-black/5">
                          {newsList.filter(n => !n.is_read).length > 0 && (
                              <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center bg-red-500 text-white text-[10px] font-black h-5 min-w-[20px] px-1.5 rounded-full border-2 border-white shadow-sm z-10">
                                  {newsList.filter(n => !n.is_read).length}
                              </div>
                          )}
                          <svg className="w-10 h-10 text-white/95" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                      </div>
                      <span className="text-[12px] font-semibold text-slate-700 text-center leading-tight tracking-tight">ข่าวสาร</span>
                  </div>

                  {/* Icon 5: Family (Owner only) */}
                  <div className="flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95" onClick={() => setView('family')}>
                      <div className="w-[76px] h-[76px] rounded-[18px] bg-gradient-to-b from-[#ec4899] to-[#be185d] shadow-md flex items-center justify-center ring-1 ring-black/5">
                          <svg className="w-10 h-10 text-white/95" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                      </div>
                      <span className="text-[12px] font-semibold text-slate-700 text-center leading-tight tracking-tight">ผู้ใช้ประจำ</span>
                  </div>

                  {/* Icon 6: Visitors */}
                  <div className="flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95" onClick={() => { setView('appointment'); setApptFilter('WALKIN'); }}>
                      <div className="w-[76px] h-[76px] rounded-[18px] bg-gradient-to-b from-[#8b5cf6] to-[#6d28d9] shadow-md flex items-center justify-center relative ring-1 ring-black/5">
                          {walkinApptCount > 0 && (
                              <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center bg-red-500 text-white text-[10px] font-black h-5 min-w-[20px] px-1.5 rounded-full border-2 border-white shadow-sm z-10">{walkinApptCount}</div>
                          )}
                          <svg className="w-10 h-10 text-white/95" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                      </div>
                      <span className="text-[12px] font-semibold text-slate-700 text-center leading-tight tracking-tight">ผู้มาติดต่อ</span>
                  </div>

                  {/* Icon 7: Contact Staff */}
                  <div className="flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95" onClick={() => {
                      if (profileData?.resident?.site_contact_link) {
                          window.location.href = profileData.resident.site_contact_link;
                      } else {
                          alert('สถานที่นี้ยังไม่ได้กำหนดช่องทางติดต่อเจ้าหน้าที่');
                      }
                  }}>
                      <div className="w-[76px] h-[76px] rounded-[18px] bg-gradient-to-b from-[#6366f1] to-[#4338ca] shadow-md flex items-center justify-center ring-1 ring-black/5">
                          <svg className="w-10 h-10 text-white/95" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                      </div>
                      <span className="text-[12px] font-semibold text-slate-700 text-center leading-tight tracking-tight">ติดต่อเจ้าหน้าที่</span>
                  </div>
              </div>
              <p className="text-center text-xs text-slate-400 mt-6 pb-6 w-full">PSS GO &copy; Powered by PSS</p>
          </div>
      );
  }

  // --- News View ---
  if (view === 'news') {
      return (
          <div className="min-h-screen bg-[#F4F4F4] text-slate-800 p-4 font-sans pb-20">
              <div className="max-w-md mx-auto">
                  <div className="flex items-center justify-between mb-4">
                      <button 
                          onClick={() => setView('menu')}
                          className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-800 px-2 transition-colors"
                      >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                          </svg>
                          กลับหน้าเมนูหลัก
                      </button>
                      {/* Refresh Button */}
                      <button 
                          onClick={() => loadNews()} 
                          className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                         <svg className={`w-5 h-5 ${isLoadingNews ? 'animate-spin text-[#06C755]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                         </svg>
                      </button>
                  </div>

                  <div className="flex flex-col items-center mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-3">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                          </svg>
                      </div>
                      <h1 className="text-2xl font-bold tracking-tight">ประกาศ & ข่าวสาร</h1>
                      <p className="text-sm text-slate-500">{profileData?.resident?.site_name}</p>
                  </div>

                  <div className="space-y-4">
                      {isLoadingNews && newsList.length === 0 ? (
                          <div className="text-center p-8 text-slate-500">
                              <svg className="animate-spin w-8 h-8 mx-auto text-orange-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              กำลังโหลดประกาศ...
                          </div>
                      ) : newsList.length > 0 ? (
                          newsList.map((news) => (
                              <div key={news.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                                  {!news.is_read && (
                                      <div className="absolute top-5 right-5 w-3 h-3 bg-red-500 rounded-full shadow-sm shadow-red-200 animate-pulse"></div>
                                  )}
                                  <div className="mb-2">
                                      <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md mb-2 inline-block">
                                          {new Date(news.created_at).toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                                      </span>
                                  </div>
                                  <h3 className={`text-base font-bold text-slate-800 ${!news.is_read ? '' : 'text-slate-600'}`}>{news.title}</h3>
                                  <p className="text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap">{news.content}</p>
                                  {news.image_url && (
                                    <div className="mt-3 rounded-xl overflow-hidden border border-slate-100 shadow-sm relative w-full" style={{ aspectRatio: '16/9' }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={typeof window !== 'undefined' ? `${window.location.origin}${news.image_url.startsWith('/') ? '' : '/'}${news.image_url}` : news.image_url} alt={news.title} className="object-cover w-full h-full" />
                                    </div>
                                  )}
                                  {!news.is_read && (
                                      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                                        <button 
                                            onClick={async () => {
                                                await markNewsAsRead(news.id, profileData.resident.id);
                                                setNewsList(prev => prev.map(n => n.id === news.id ? { ...n, is_read: true } : n));
                                            }}
                                            className="text-xs font-bold text-[#06C755] hover:text-[#05b34c] bg-[#06C755]/10 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            รับทราบ
                                        </button>
                                      </div>
                                  )}
                              </div>
                          ))
                      ) : (
                          <div className="text-center p-8 bg-white rounded-3xl border border-slate-100 text-slate-400">
                              <svg className="w-12 h-12 mx-auto mb-3 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                              </svg>
                              ยังไม่มีประกาศใหม่
                          </div>
                      )}
                  </div>
              </div>
          </div>
      );
  }

  // --- Family Members View ---
  if (view === 'family') {
      if (!profileData?.resident?.is_owner) {
          return (
              <div className="min-h-screen bg-[#F4F4F4] text-slate-800 p-4 flex flex-col items-center justify-center">
                  <div className="bg-white p-8 rounded-3xl shadow-sm text-center">
                      <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                      </div>
                      <h2 className="text-lg font-bold mb-2">เฉพาะเจ้าบ้านเท่านั้น</h2>
                      <p className="text-slate-500 text-sm mb-6">ฟีเจอร์นี้สงวนสิทธิ์สำหรับเจ้าบ้าน เพื่อความปลอดภัยของข้อมูล</p>
                      <button onClick={() => setView('menu')} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors">
                          กลับเมนูหลัก
                      </button>
                  </div>
                  <p className="text-center text-[10px] text-slate-400 mt-6 pb-6 w-full">PSS GO &copy; Powered by PSS</p>
              </div>
          );
      }

      const totalAllowed = profileData?.maxResidents || profileData?.maxVehicles || 1;
      const currentFamily = profileData?.familyMembers || [];
      // Current count includes the owner themselves
      const currentCount = currentFamily.length + 1;
      const isLimitReached = currentCount >= totalAllowed;

      return (
          <div className="min-h-screen bg-[#F4F4F4] text-slate-800 p-4 font-sans pb-20">
              <div className="max-w-md mx-auto">
                  <button 
                      onClick={() => setView('menu')}
                      className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-800 mb-4 px-2 transition-colors"
                  >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                      กลับหน้าเมนูหลัก
                  </button>

                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-6 p-6">
                      <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                          </div>
                          <div>
                              <div className="text-xs font-bold text-pink-600 mb-0.5">{profileData?.resident?.site_name || 'ไม่ระบุสถานที่'}</div>
                              <h1 className="text-xl font-bold tracking-tight">ผู้ใช้ประจำสถานที่/ห้อง {profileData?.resident?.house_number}</h1>
                              <p className="text-sm text-slate-500">โควต้า: {currentCount} / {totalAllowed} คน</p>
                          </div>
                      </div>

                      <form onSubmit={handleInviteFamily} className="mb-6">
                          <label className="block text-xs font-bold text-slate-600 mb-2">เชิญผู้เช่า/ร้าน/บริษัทเพิ่ม</label>
                          <div className="flex gap-2">
                              <input 
                                  type="text"
                                  placeholder="ชื่อผู้ใช้ประจำ"
                                  value={newMemberName}
                                  onChange={(e) => setNewMemberName(e.target.value)}
                                  disabled={isSubmitting || isLimitReached}
                                  className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-[#ec4899] focus:border-[#ec4899] p-3 outline-none"
                              />
                              <button 
                                  type="submit"
                                  disabled={isSubmitting || !newMemberName || isLimitReached}
                                  className={`px-5 py-3 rounded-xl font-bold text-white transition-all ${isLimitReached ? 'bg-slate-300' : 'bg-pink-600 hover:bg-pink-700 shadow-md shadow-pink-600/20'}`}
                              >
                                  {isSubmitting ? 'รอ...' : 'สร้างลิงก์'}
                              </button>
                          </div>
                          {isLimitReached && (
                              <p className="text-xs text-rose-500 mt-2 font-medium">เพิ่มผู้ใช้ประจำครบเต็มจำนวนโควต้าแล้ว</p>
                          )}
                          {familyResult && (
                              <div className={`mt-3 p-3 rounded-xl text-xs font-bold ${familyResult.success ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                  {familyResult.message}
                                  {familyResult.inviteCode && (
                                      <div className="mt-2 bg-white/80 p-2 rounded border border-green-200 font-mono text-center flex flex-col items-center gap-2 text-sm text-slate-700">
                                          <div>รหัสสำหรับเชิญ: <span className="text-green-700 select-all">{familyResult.inviteCode}</span></div>
                                          
                                          <a 
                                            href={`https://line.me/R/msg/text/?${encodeURIComponent(`แจ้งเตือนจากเจ้าสถานที่/ห้อง ${profileData?.resident?.house_number}\nขอเรียนเชิญคุณเป็นผู้ใช้ประจำใน PSS GO\nรหัสเชิญของคุณคือ: ${familyResult.inviteCode}\n\nกรุณากดลิงก์นี้เพื่อดำเนินการลงทะเบียน:\nhttps://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID || "1234567890-AbcdEfgh"}?inviteCode=${familyResult.inviteCode}`)}`}
                                            target="_blank"
                                            className="w-full py-2 bg-[#06C755] text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#05b34c]"
                                          >
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                              <path d="M22.288 11.08c0-4.996-4.966-9.055-11.055-9.055-6.096 0-11.054 4.059-11.054 9.055 0 4.417 3.753 8.163 8.877 8.924.346.074.815.228.937.525.109.263.072.673.033.945l-.176 1.055c-.055.334-.258 1.258 1.103.684s7.332-4.316 9.544-7.147c1.171-1.488 1.791-3.13 1.791-4.986z" />
                                            </svg>
                                            ส่งผ่าน LINE
                                          </a>
                                      </div>
                                  )}
                              </div>
                          )}
                      </form>

                      <div>
                          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 block">รายชื่อผู้ใช้ประจำ</h3>
                          <div className="space-y-3">
                              {/* The Owner */}
                              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                      <img src={profileData?.resident?.line_picture_url || "https://via.placeholder.com/150"} className="w-10 h-10 rounded-full object-cover shadow-sm bg-white" />
                                      <div>
                                          <p className="text-sm font-bold leading-tight">{profileData?.resident?.line_display_name || "เจ้าบ้าน"}</p>
                                          <p className="text-xs text-slate-500">เจ้าของบ้าน (คุณ)</p>
                                      </div>
                                  </div>
                              </div>
                              
                              {/* Sub Residents */}
                              {currentFamily.map((member: any) => (
                                  <div key={member.id} className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-2 shadow-sm relative overflow-hidden">
                                      <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                              {member.line_picture_url ? (
                                                  <img src={member.line_picture_url} className="w-10 h-10 rounded-full object-cover shadow-sm bg-slate-100" />
                                              ) : (
                                                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                                                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                      </svg>
                                                  </div>
                                              )}
                                              <div>
                                                  <p className="text-sm font-bold leading-tight line-clamp-1">{member.line_display_name || member.owner_name}</p>
                                                  <p className="text-[11px] text-slate-500 font-mono">CODE: {member.invite_code}</p>
                                              </div>
                                          </div>
                                          <button 
                                              onClick={() => handleRevokeFamily(member.id)}
                                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
                                              title="ยกเลิกสิทธิ์"
                                          >
                                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                              </svg>
                                          </button>
                                      </div>
                                      {!member.line_user_id && (
                                          <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-100">
                                              <div className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-1 rounded border border-amber-200 flex items-center gap-1.5">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                  รอผู้ใช้งานกดรับคำเชิญ
                                              </div>
                                              <a 
                                                  href={`https://line.me/R/msg/text/?${encodeURIComponent(`แจ้งเตือนจากเจ้าสถานที่/ห้อง ${profileData?.resident?.house_number}\nขอเรียนเชิญคุณเป็นผู้ใช้ประจำใน PSS GO\nรหัสเชิญของคุณคือ: ${member.invite_code}\n\nกรุณากดลิงก์นี้เพื่อดำเนินการลงทะเบียน:\nhttps://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID || "1234567890-AbcdEfgh"}?inviteCode=${member.invite_code}`)}`}
                                                  target="_blank"
                                                  className="bg-[#06C755]/10 text-[#06C755] hover:bg-[#06C755]/20 text-[10px] font-bold px-3 py-1 rounded border border-[#06C755]/30 flex items-center gap-1 transition-colors"
                                              >
                                                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                                      <path d="M22.288 11.08c0-4.996-4.966-9.055-11.055-9.055-6.096 0-11.054 4.059-11.054 9.055 0 4.417 3.753 8.163 8.877 8.924.346.074.815.228.937.525.109.263.072.673.033.945l-.176 1.055c-.055.334-.258 1.258 1.103.684s7.332-4.316 9.544-7.147c1.171-1.488 1.791-3.13 1.791-4.986z" />
                                                  </svg>
                                                  ส่งคำเชิญ
                                              </a>
                                          </div>
                                      )}
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
              <p className="text-center text-xs text-slate-400 mt-6 pb-6 w-full">PSS GO &copy; Powered by PSS</p>
          </div>
      );
  }

  // --- Appointment View ---
  if (view === 'appointment') {
      return (
          <div className="min-h-screen bg-[#F4F4F4] text-slate-800 p-4 font-sans pb-20">
              <div className="max-w-md mx-auto">
                  <button 
                      onClick={() => setView('menu')}
                      className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-800 mb-4 px-2 transition-colors"
                  >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                      กลับหน้าเมนูหลัก
                  </button>

                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-6 p-6">
                      <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                              </div>
                              <div>
                                  <h1 className="text-xl font-bold tracking-tight">{apptFilter === 'WALKIN' ? 'ผู้มาติดต่อ' : 'ระบบนัดหมาย'}</h1>
                                  <p className="text-sm text-slate-500">{apptFilter === 'WALKIN' ? 'ผู้มาติดต่อที่ไม่ได้นัดหมาย' : 'สำหรับผู้มาติดต่อ'}</p>
                              </div>
                          </div>
                          {apptViewMode === 'LIST' && (
                              <button 
                                  onClick={loadAppts} 
                                  disabled={isLoadingAppts}
                                  className="p-2 bg-slate-50 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors disabled:opacity-50"
                                  title="รีเฟรชข้อมูล"
                              >
                                  <svg className={`w-5 h-5 ${isLoadingAppts ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                              </button>
                          )}
                      </div>

                      {apptViewMode === 'LIST' ? (
                          <div className="animate-in fade-in zoom-in duration-300">
                              <div className="flex items-center justify-between mb-4 bg-slate-50 p-2 rounded-xl">
                                  <button onClick={() => {
                                      if (apptMonth === 1) { setApptMonth(12); setApptYear(apptYear - 1); }
                                      else { setApptMonth(apptMonth - 1); }
                                  }} className="p-2 hover:bg-slate-200 rounded-lg transition text-slate-500">
                                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                                  </button>
                                  <div className="font-bold text-slate-700">เดือน {apptMonth}/{apptYear}</div>
                                  <button onClick={() => {
                                      if (apptMonth === 12) { setApptMonth(1); setApptYear(apptYear + 1); }
                                      else { setApptMonth(apptMonth + 1); }
                                  }} className="p-2 hover:bg-slate-200 rounded-lg transition text-slate-500">
                                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                                  </button>
                              </div>
                              
                              {apptFilter !== 'WALKIN' && (
                                  <button onClick={() => setApptViewMode('CREATE')} className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white font-bold py-3.5 rounded-xl mb-6 transition-transform shadow-sm flex justify-center items-center gap-2">
                                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                      </svg>
                                      สร้างนัดหมายใหม่
                                  </button>
                              )}

                              {isLoadingAppts ? (
                                  <div className="text-center py-8 text-slate-400">กำลังโหลด...</div>
                              ) : apptList.length === 0 ? (
                                  <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
                                      ไม่พบประวัติการนัดหมายในเดือนนี้
                                  </div>
                              ) : (
                                  <div className="space-y-3">
                                      {apptList.filter((a: any) => {
                                          if (apptFilter === 'APPOINTMENT') return !!a.invite_token;
                                          if (apptFilter === 'WALKIN') return !a.invite_token;
                                          return true;
                                      }).length === 0 ? (
                                          <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
                                              ไม่พบประวัติในหมวดหมู่นี้
                                          </div>
                                      ) : apptList.filter((a: any) => {
                                          if (apptFilter === 'APPOINTMENT') return !!a.invite_token;
                                          if (apptFilter === 'WALKIN') return !a.invite_token;
                                          return true;
                                      }).map(appt => {
                                          const isExpanded = expandedApptId === appt.id;
                                          return (
                                          <div 
                                              key={appt.id} 
                                              onClick={() => setExpandedApptId(isExpanded ? null : appt.id)}
                                              className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col gap-1 text-sm cursor-pointer hover:border-sky-200 transition-all select-none"
                                          >
                                              <div className="flex justify-between items-start mb-1">
                                                  <div className="font-bold text-slate-800 text-base">{appt.full_name}</div>
                                                  <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                      appt.status === 'INVITED' ? 'bg-amber-100 text-amber-700' :
                                                      appt.status === 'PRE' ? 'bg-blue-100 text-blue-700' :
                                                      appt.status === 'IN' ? 'bg-green-100 text-green-700' :
                                                      appt.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' :
                                                      'bg-slate-100 text-slate-600'
                                                  }`}>
                                                      {appt.status === 'INVITED' ? 'รอลงทะเบียน' :
                                                       appt.status === 'PRE' ? 'ลงทะเบียนแล้ว' :
                                                       appt.status === 'IN' ? 'เข้าหมู่บ้านแล้ว' :
                                                       appt.status === 'OUT' ? 'ออกหมู่บ้านแล้ว' : 
                                                       appt.status === 'CANCELLED' ? 'ยกเลิกแล้ว' :
                                                       appt.status}
                                                  </div>
                                              </div>
                                              
                                              {isExpanded ? (
                                                  <>
                                                      <div className="flex gap-3 mt-1 animate-in slide-in-from-top-1 fade-in duration-200">
                                                          {appt.image_url && (
                                                              <img src={typeof window !== 'undefined' ? `${window.location.origin}${appt.image_url.startsWith('/') ? '' : '/'}${appt.image_url}` : appt.image_url} alt="Vehicle" className="w-16 h-16 object-cover rounded-lg border border-slate-100 flex-shrink-0" />
                                                          )}
                                                          <div className="flex flex-col gap-1 flex-1">
                                                              {appt.purpose && <div className="text-slate-500">ธุระ: {appt.purpose}</div>}
                                                              {appt.vehicle_plate && <div className="text-slate-500">ทะเบียน: {appt.vehicle_plate}</div>}
                                                          </div>
                                                      </div>

                                                      <div className="flex justify-between items-center mt-3 border-t border-slate-100 pt-3 animate-in slide-in-from-top-1 fade-in duration-200">
                                                          <div className="text-slate-400 text-xs">
                                                              {appt.expected_in_time && `วันที่นัด: ${new Date(appt.expected_in_time).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}`}
                                                              {!appt.expected_in_time && appt.check_in_time && `เวลาเข้า: ${new Date(appt.check_in_time).toLocaleString('th-TH')}`}
                                                          </div>
                                                          {appt.status === 'IN' && (
                                                              <div className="flex gap-2 items-center">
                                                                  {!appt.e_stamp ? (
                                                                      <button 
                                                                          onClick={async (e) => {
                                                                              e.stopPropagation();
                                                                              if (confirm('ยืนยันประทับตรา E-Stamp ให้ผู้มาติดต่อรายนี้?')) {
                                                                                  setIsLoadingAppts(true);
                                                                                  const res = await eStampVisitor(appt.id, profileData.resident.id);
                                                                                  if (!res.success) alert(res.message);
                                                                                  await loadAppts();
                                                                              }
                                                                          }}
                                                                          className="text-[#06C755] bg-[#06C755]/10 hover:bg-[#06C755]/20 px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-sm transition-all shrink-0 border border-[#06C755]/20"
                                                                      >
                                                                          ประทับตรา (E-Stamp)
                                                                      </button>
                                                                  ) : (
                                                                      <div className="text-white bg-[#06C755] px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-sm flex items-center gap-1.5 shrink-0">
                                                                          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                          </svg>
                                                                          E-Stamped แล้ว
                                                                      </div>
                                                                  )}
                                                              </div>
                                                          )}
                                                          {appt.status === 'INVITED' && appt.invite_token && (
                                                              <div className="flex gap-2 items-center">
                                                                  <button 
                                                                      onClick={async (e) => {
                                                                          e.stopPropagation();
                                                                          if (confirm('คุณต้องการยกเลิกคำเชิญนี้ใช่หรือไม่?')) {
                                                                              await cancelVisitorInvite(appt.id);
                                                                              loadAppts();
                                                                          }
                                                                      }}
                                                                      className="text-slate-500 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-sm transition-all shrink-0"
                                                                  >
                                                                      ยกเลิกคำเชิญ
                                                                  </button>
                                                                  <a 
                                                                      href={`https://line.me/R/msg/text/?${encodeURIComponent(`คุณได้รับคำเชิญการมาเยือนที่ ${profileData?.resident?.site_name || 'สถานที่'} (สถานที่/ห้อง ${profileData?.resident?.house_number})\nสำหรับ: ${appt.full_name}\n\nกรุณากรอกข้อมูลเพื่อความสะดวกรวดเร็วในการเข้าสถานที่ที่ลิงก์นี้:\n${isInitialized ? window.location.origin : 'https://pssgo.com'}/visitor/preregister?token=${appt.invite_token}`)}`}
                                                                      target="_blank"
                                                                      onClick={(e) => e.stopPropagation()}
                                                                      className="text-white bg-[#06C755] hover:bg-[#05b34c] px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                                                                  >
                                                                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 3.987 8.868 9.539 9.59.389.051.916.155 1.05.513.125.32-.038.823-.119 1.201-.096.44-0.447 2.158-.543 2.65-.162.83-.815 3.992 3.493 2.193C18.17 23.945 24 16.969 24 10.304zM10.835 12.871h-2.19v-4.571a.639.639 0 111.278 0v3.931h.912a.639.639 0 010 1.278zm4.499-1.278v1.278h-.912v-1.278h-.002v-3.293h.914v4.571h.002zM15.426 8.3h.913v4.571h-.913V8.3zm3.931 4.571h-2.19v-4.571h2.19a.639.639 0 010 1.278h-.912v.364h.912a.639.639 0 010 1.278h-.912v.373h.912a.639.639 0 010 1.278z" /></svg>
                                                                      แชร์
                                                                  </a>
                                                              </div>
                                                          )}
                                                      </div>
                                                  </>
                                              ) : (
                                                  <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
                                                      <div>
                                                          {appt.expected_in_time && `วันนัด: ${new Date(appt.expected_in_time).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}`}
                                                          {!appt.expected_in_time && appt.check_in_time && `เวลาเข้า: ${new Date(appt.check_in_time).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})}`}
                                                      </div>
                                                      <div className="text-sky-500 font-medium">ดูรายละเอียด ▾</div>
                                                  </div>
                                              )}
                                          </div>
                                      )})}
                                  </div>
                              )}
                          </div>
                      ) : (
                          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                              <button onClick={() => setApptViewMode('LIST')} className="mb-4 text-sm text-slate-500 font-bold flex gap-1 items-center hover:text-slate-800">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg> กลับหน้ารายการนัดหมาย
                              </button>

                              {!isApptLinkReady ? (
                                  <div className="bg-sky-50 rounded-2xl p-5 border border-sky-100 mb-6">
                                      <form onSubmit={async (e) => { 
                                          e.preventDefault(); 
                                          setIsSubmitting(true);
                                          const res = await createVisitorInvite({
                                              fullName: apptName,
                                              purpose: apptPurpose,
                                              expectedDate: apptStart,
                                              residentId: profileData?.resident?.id
                                          });
                                          setIsSubmitting(false);
                                          if (res.success && res.token) {
                                              setApptToken(res.token);
                                              setIsApptLinkReady(true);
                                          } else {
                                              alert("เกิดข้อผิดพลาดในการสร้างนัดหมาย");
                                          }
                                      }} className="space-y-4 text-sm font-medium">
                                          <div>
                                              <label className="block text-xs font-bold text-slate-500 mb-2">ชื่อผู้มาติดต่อ</label>
                                              <input type="text" value={apptName} onChange={e => setApptName(e.target.value)} required placeholder="เช่น สมชาย ใจดี" className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
                                          </div>
                                          <div>
                                              <label className="block text-xs font-bold text-slate-500 mb-2">วันที่จะเข้ามา</label>
                                              <input type="date" value={apptStart} onChange={e => setApptStart(e.target.value)} required className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 min-h-[48px]" />
                                          </div>
                                          <div>
                                              <label className="block text-xs font-bold text-slate-500 mb-2">ติดต่อเรื่อง / ธุระ</label>
                                              <input type="text" value={apptPurpose} onChange={e => setApptPurpose(e.target.value)} required placeholder="เช่น ส่งพัสดุ, ต่อเติมบ้าน, ซ่อมแอร์" className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
                                          </div>
                                          <button type="submit" disabled={isSubmitting} className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white font-bold py-3.5 rounded-xl mt-4 transition-transform active:scale-95 shadow-sm flex justify-center items-center gap-2 disabled:opacity-50">
                                              {isSubmitting ? 'กำลังสร้าง...' : 'สร้างลิงก์คำเชิญ'}
                                          </button>
                                      </form>
                                  </div>
                              ) : (
                                  <div className="bg-sky-50 rounded-2xl p-5 border border-sky-100 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
                                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-sky-100 flex items-center justify-center mb-3">
                                          <svg className="w-8 h-8 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                          </svg>
                                      </div>
                                      <h2 className="text-md font-bold text-slate-800 mb-1">นัดหมายถูกสร้างเรียบร้อย</h2>
                                      <p className="text-xs text-slate-500 mb-4">
                                          กรุณาส่งลิงก์ให้คุณ {apptName} เพื่อใช้ลงทะเบียนล่วงหน้า
                                      </p>
                                      
                                      <div className="w-full">
                                          <a 
                                              href={`https://line.me/R/msg/text/?${encodeURIComponent(`คุณได้รับคำเชิญการมาเยือนที่ ${profileData?.resident?.site_name || 'สถานที่'} (สถานที่/ห้อง ${profileData?.resident?.house_number})\nสำหรับ: ${apptName}\n\nกรุณากรอกข้อมูลเพื่อความสะดวกรวดเร็วในการเข้าสถานที่ที่ลิงก์นี้:\n${isInitialized ? window.location.origin : 'https://pssgo.com'}/visitor/preregister?token=${apptToken}`)}`}
                                              target="_blank"
                                              className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white font-bold py-3.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
                                          >
                                              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 3.987 8.868 9.539 9.59.389.051.916.155 1.05.513.125.32-.038.823-.119 1.201-.096.44-0.447 2.158-.543 2.65-.162.83-.815 3.992 3.493 2.193C18.17 23.945 24 16.969 24 10.304zM10.835 12.871h-2.19v-4.571a.639.639 0 111.278 0v3.931h.912a.639.639 0 010 1.278zm4.499-1.278v1.278h-.912v-1.278h-.002v-3.293h.914v4.571h.002zM15.426 8.3h.913v4.571h-.913V8.3zm3.931 4.571h-2.19v-4.571h2.19a.639.639 0 010 1.278h-.912v.364h.912a.639.639 0 010 1.278h-.912v.373h.912a.639.639 0 010 1.278z" /></svg>
                                              ส่งคำเชิญผ่าน LINE
                                          </a>
                                      </div>
                                      <button onClick={() => { setIsApptLinkReady(false); setApptViewMode('LIST'); setApptName(""); setApptPurpose(""); setApptStart(""); setApptToken(""); }} className="mt-4 text-xs font-bold text-slate-400 hover:text-slate-600 underline">
                                          กลับไปหน้ารายการนัดหมาย
                                      </button>
                                  </div>
                              )}
                          </div>
                      )}
                  </div>
              </div>
              <p className="text-center text-xs text-slate-400 mt-6 pb-6 w-full">PSS GO &copy; Powered by PSS</p>
          </div>
      );
  }

  // --- Access Logs View ---
  if (view === 'access') {
      return (
          <div className="min-h-screen bg-[#F4F4F4] text-slate-800 p-4 font-sans pb-20">
              <div className="max-w-md mx-auto">
                  <button 
                      onClick={() => setView('menu')}
                      className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-800 mb-4 px-2 transition-colors"
                  >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                      กลับหน้าเมนูหลัก
                  </button>

                  <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden relative">
                      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#14b8a6]/20 to-transparent pointer-events-none"></div>
                      <div className="p-6 relative">
                          <div className="flex items-center gap-4 mb-6">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14b8a6] to-[#0f766e] flex items-center justify-center text-white shadow-sm">
                                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 18h16M12 6v12" />
                                  </svg>
                              </div>
                              <div>
                                  <h1 className="text-xl font-bold tracking-tight">ประวัติเข้าออก</h1>
                                  <p className="text-sm text-slate-500">ยานพาหนะของสถานที่/ห้อง {profileData?.resident?.house_number}</p>
                              </div>
                          </div>

                          {isLoadingLogs ? (
                              <div className="text-center py-8 text-slate-400">กำลังโหลดข้อมูล...</div>
                          ) : accessLogs.length === 0 ? (
                              <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
                                  ไม่พบประวัติการเข้าออก
                              </div>
                          ) : (
                              <div className="space-y-4">
                                  {accessLogs.map((log: any) => (
                                      <div key={log.id} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 relative overflow-hidden group">
                                          <div className={`w-1.5 absolute left-0 top-0 bottom-0 ${log.action === 'IN' ? 'bg-[#06C755]' : 'bg-rose-500'}`}></div>
                                          <div className="flex-1 min-w-0 flex items-center justify-between">
                                              <div>
                                                  <div className="flex items-center gap-2 mb-1">
                                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${log.action === 'IN' ? 'bg-[#06C755]/10 text-[#06C755]' : 'bg-rose-100 text-rose-600'}`}>
                                                          {log.action === 'IN' ? 'ขาเข้า (IN)' : 'ขาออก (OUT)'}
                                                      </span>
                                                      <span className="text-xs text-slate-400 font-medium">
                                                          {new Date(log.created_at).toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                                                      </span>
                                                  </div>
                                                  <div className="font-bold text-lg text-slate-800">{log.license_plate}</div>
                                                  <div className="text-xs text-slate-500">{log.gate_name || 'เข้า/ออกสถานที่'}</div>
                                              </div>
                                              {log.image_url && (
                                                  <img 
                                                      src={(() => {
                                                          const cleanUrl = '/' + log.image_url.replace(/^[\\/]+/, '').replace(/\\/g, '/');
                                                          const baseUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_BASE_URL || '');
                                                          return `${baseUrl}${cleanUrl}?rev=${log.id}`;
                                                      })()}
                                                      alt="LPR" 
                                                      className="w-16 h-12 rounded bg-slate-200 object-cover" 
                                                  />
                                              )}
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  </div>
              </div>
              <p className="text-center text-xs text-slate-400 mt-6 pb-6 w-full">PSS GO &copy; Powered by PSS</p>
          </div>
      );
  }

  // --- Profile / Registration View ---
  return (
    <div className="min-h-screen bg-[#F4F4F4] text-slate-800 p-4 font-sans pb-20">
      <div className="max-w-md mx-auto">
        {profileData?.isRegistered && (
            <button 
                onClick={() => setView('menu')}
                className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-800 mb-2 px-2 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                กลับหน้าเมนูหลัก
            </button>
        )}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Header Profile */}
        <div className="bg-gradient-to-b from-[#06C755]/10 to-transparent p-6 text-center">
          <div className="relative inline-block mt-4">
            <img 
              src={profile?.pictureUrl || "https://via.placeholder.com/150"} 
              alt="Profile" 
              className="w-24 h-24 rounded-full border-4 border-white shadow-md mx-auto object-cover"
            />
            <div className="absolute bottom-0 right-1 w-6 h-6 bg-[#06C755] border-2 border-white rounded-full"></div>
          </div>
          <h1 className="text-xl font-bold mt-4 mb-1">{profile?.displayName}</h1>
          <p className="text-xs text-slate-400 break-all">{profile?.userId}</p>
        </div>

        {/* Action Form */}
        <div className="p-6">
          {profileData?.isRegistered && !showAddCarForm ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 text-center">ข้อมูลบ้านและรถของคุณ</h2>
                  
                  {result && (
                      <div className={`p-4 rounded-xl mb-6 text-sm font-bold text-center ${result.success ? 'bg-[#06C755]/10 text-[#06C755] border border-[#06C755]/20' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                          {result.message}
                      </div>
                  )}

                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 mb-6 text-center shadow-inner">
                      <div className="text-sm font-bold text-[#06C755] mb-0.5">{profileData.resident.site_name || 'ไม่ระบุสถานที่'}</div>
                      <div className="text-xs text-slate-500 mb-1">รหัสสถานที่/ห้อง</div>
                      <div className="text-3xl font-black text-slate-800">{profileData.resident.house_number}</div>
                  </div>

                  <div className="mb-4 flex flex-row items-center justify-between">
                      <h3 className="font-bold text-slate-700">ข้อมูลส่วนตัว</h3>
                      <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="text-xs text-sky-500 font-bold hover:text-sky-600 transition">
                          {isEditingProfile ? 'ยกเลิก' : 'แก้ไข'}
                      </button>
                  </div>
                  
                  {isEditingProfile ? (
                      <form onSubmit={async (e) => {
                          e.preventDefault();
                          setIsSubmitting(true);
                          const res = await updateLiffProfile(profileData.resident.id, profile?.userId || "", { ownerName: editOwnerName, phoneNumber: editPhoneNumber });
                          setIsSubmitting(false);
                          setResult(res);
                          if (res.success) {
                              setIsEditingProfile(false);
                              // Refresh profile data
                              const data = await getLiffProfileData(profile?.userId || "");
                              setProfileData(data);
                          }
                      }} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 space-y-3">
                          <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">ชื่อ-นามสกุล</label>
                              <input 
                                  type="text" 
                                  value={editOwnerName} 
                                  onChange={e => setEditOwnerName(e.target.value)} 
                                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-[#06C755] focus:border-[#06C755] block p-2.5"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">เบอร์โทรศัพท์</label>
                              <input 
                                  type="tel" 
                                  value={editPhoneNumber} 
                                  onChange={e => setEditPhoneNumber(e.target.value)} 
                                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-[#06C755] focus:border-[#06C755] block p-2.5"
                              />
                          </div>
                          <button type="submit" disabled={isSubmitting} className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white text-sm font-bold py-2.5 rounded-lg transition-transform active:scale-95">
                              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                          </button>
                      </form>
                  ) : (
                      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-6 flex items-center gap-4">
                          <img src={profileData.resident.line_picture_url || "https://via.placeholder.com/150"} alt="Profile" className="w-14 h-14 rounded-full object-cover bg-slate-100" />
                          <div>
                              <div className="font-bold text-slate-800">{profileData.resident.owner_name || profileData.resident.line_display_name || 'ไม่ได้ระบุชื่อ'}</div>
                              <div className="text-xs text-slate-500">{profileData.resident.phone_number || 'ไม่ได้ระบุเบอร์โทรศัพท์'}</div>
                          </div>
                      </div>
                  )}

                  <div className="mb-6 bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                      <div>
                          <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              โหมดความเป็นส่วนตัว (Privacy Mode)
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">ไม่อนุญาตให้ผู้มาติดต่อแลกบัตรเข้าพบได้</div>
                      </div>
                      <button 
                          onClick={async () => {
                              const newValue = !isPrivacyMode;
                              setIsPrivacyMode(newValue);
                              const res = await togglePrivacyMode(profile?.userId || '', newValue);
                              if (!res.success) {
                                  setIsPrivacyMode(!newValue); // revert
                                  alert('เกิดข้อผิดพลาดในการตั้งค่า: ' + res.message);
                              }
                          }}
                          className={`w-12 h-7 rounded-full transition-colors relative ${isPrivacyMode ? 'bg-[#06C755]' : 'bg-slate-300'}`}
                      >
                          <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow transition-transform ${isPrivacyMode ? 'translate-x-6' : 'translate-x-1'}`}></div>
                      </button>
                  </div>

                  <div className="mb-4 flex justify-between items-end">
                      <h3 className="font-bold text-slate-700">รถที่ลงทะเบียนแล้ว ({profileData.vehicles?.length || 0}/{profileData.maxVehicles})</h3>
                  </div>

                  {profileData.vehicles && profileData.vehicles.length > 0 ? (
                      <div className="space-y-3 mb-6">
                          {profileData.vehicles.map((v: any) => (
                              <div key={v.id} className="flex items-center gap-4 bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
                                  {v.image_url ? (
                                      <div className="flex-shrink-0">
                                            <img 
                                                src={(() => {
                                                    const cleanUrl = '/' + v.image_url.replace(/^[\\/]+/, '').replace(/\\/g, '/');
                                                    const baseUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_BASE_URL || '');
                                                    return `${baseUrl}${cleanUrl}?rev=${v.id}`;
                                                })()}
                                                alt="Car" 
                                                className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-sm" 
                                            />
                                      </div>
                                  ) : (
                                      <div className="w-16 h-16 bg-slate-100 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 flex-shrink-0">
                                          <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                                      </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-0.5">
                                          <div className="font-bold text-lg text-slate-800 truncate">{v.license_plate}</div>
                                          {v.type_name && (
                                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md whitespace-nowrap">
                                                  {v.type_name}
                                              </span>
                                          )}
                                      </div>
                                      <div className="text-xs text-slate-500 mb-1.5">{v.province || 'ไม่ระบุจังหวัด'} • {v.color || 'ไม่ระบุสี'}</div>
                                      <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100">
                                          {v.line_picture_url ? (
                                              <img src={v.line_picture_url} className="w-4 h-4 rounded-full object-cover" alt="Line account" />
                                          ) : (
                                              <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center">
                                                  <svg className="w-2.5 h-2.5 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                              </div>
                                          )}
                                          <span className="text-[10px] text-slate-500 font-medium truncate flex-1">{v.line_display_name || v.owner_name || 'แอดมิน / เจ้าของบ้าน'}</span>
                                      </div>
                                  </div>
                                  <button
                                      type="button"
                                      onClick={async () => {
                                          if (window.confirm("คุณต้องการลบรถทะเบียน " + v.license_plate + " ใช่หรือไม่?")) {
                                              const res = await deleteLiffVehicle(v.id, profileData.resident.id);
                                              setResult(res);
                                              if (res.success) {
                                                  const data = await getLiffProfileData(profile?.userId || "");
                                                  setProfileData(data);
                                              }
                                          }
                                      }}
                                      className="p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors flex-shrink-0"
                                      title="ลบรถคันนี้"
                                  >
                                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                  </button>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-xl mb-6 text-slate-400">
                          ยังไม่มีรถที่ลงทะเบียน
                      </div>
                  )}

                  {profileData.isVillageFull ? (
                      <div className="text-center p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">
                          หมู่บ้าน/สถานที่นี้เพิ่มรถครบโควต้าเต็มจำนวนแล้ว
                      </div>
                  ) : (!profileData.vehicles || profileData.vehicles.length < profileData.maxVehicles) ? (
                      <button 
                          onClick={() => setShowAddCarForm(true)}
                          className="w-full text-[#06C755] bg-[#06C755]/10 hover:bg-[#06C755]/20 font-bold rounded-xl text-md px-5 py-4 text-center transition-colors flex justify-center items-center gap-2"
                      >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                          </svg>
                          เพิ่มรถคันใหม่
                      </button>
                  ) : (
                      <div className="text-center p-4 bg-orange-50 text-orange-600 rounded-xl text-sm font-bold border border-orange-100">
                          คุณเพิ่มรถครบโควต้าสูงสุดของบ้านแล้ว
                      </div>
                  )}
              </div>
          ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col items-center mb-8">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg shadow-black/5 bg-white mb-4">
                          <img src={logoPic.src} alt="PSS GO Logo" className="w-full h-full object-contain" />
                      </div>
                      <h1 className="text-xl font-black text-slate-800 tracking-tight">PSS GO</h1>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                          {profileData?.isRegistered ? 'เพิ่มรถคันใหม่' : 'ลงทะเบียนผูกบัญชีผู้เช่า/ร้าน/บริษัท'}
                      </h2>
                      {profileData?.isRegistered && (
                          <button onClick={() => setShowAddCarForm(false)} className="text-xs font-bold text-slate-500 hover:text-slate-800">
                              ย้อนกลับ
                          </button>
                      )}
                  </div>
                  
                  {result && (
                      <div className={`p-4 rounded-xl mb-6 text-sm font-bold ${result?.success ? 'bg-[#06C755]/10 text-[#06C755] border border-[#06C755]/20' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                          {result?.message}
                          {result?.success && result?.data && (
                              <div className="mt-2 pt-2 border-t border-[#06C755]/20 text-slate-600 font-normal space-y-1">
                                <div>สถานที่/ห้อง: <span className="font-bold text-slate-800">{result?.data.houseNumber}</span></div>
                                <div>ทะเบียน: <span className="font-bold text-slate-800">{result?.data.licensePlate}</span></div>
                              </div>
                          )}
                      </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    {!profileData?.isRegistered && (
                        <div className="space-y-3 mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-left">
                            <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">ข้อมูลส่วนตัว</h3>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                                <input 
                                    type="text"
                                    required
                                    disabled={result?.success || isSubmitting || isAnalyzing}
                                    value={editOwnerName}
                                    onChange={(e) => setEditOwnerName(e.target.value)}
                                    placeholder="เช่น สมชาย ใจดี"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-[#06C755] focus:border-[#06C755] block p-2.5 transition-colors disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
                                <input 
                                    type="tel"
                                    required
                                    disabled={result?.success || isSubmitting || isAnalyzing}
                                    value={editPhoneNumber}
                                    onChange={(e) => setEditPhoneNumber(e.target.value)}
                                    placeholder="เช่น 0812345678"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-[#06C755] focus:border-[#06C755] block p-2.5 transition-colors disabled:opacity-50 font-mono"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                        {profileData?.isRegistered ? 'ป้ายรถยนต์ที่ต้องการเพิ่ม' : 'เพิ่มรถเข้าสู่ระบบ (ตัวเลือก)'}
                    </label>
                    <p className="text-xs text-slate-500 mb-2">ให้อัปโหลดภาพรถยนต์ หรือกรอกข้อมูลเองด้านล่าง</p>
                    
                    <label className="relative w-full cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-colors border-slate-300 hover:border-[#06C755] bg-slate-50 mb-4">
                        {isAnalyzing ? (
                        <div className="text-blue-500 flex flex-col items-center pointer-events-none">
                            <svg className="animate-spin w-8 h-8 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-sm font-bold animate-pulse">AI กำลังวิเคราะห์รูปรถ...</span>
                        </div>
                        ) : (
                        <div className="text-slate-500 flex flex-col items-center pointer-events-none">
                            {imageFile ? (
                                <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-24 h-24 object-cover rounded-lg mb-2 shadow-sm" />
                            ) : (
                                <svg className="w-8 h-8 mb-2 text-[#06C755]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                            <span className="text-sm font-bold text-slate-700">{imageFile ? 'เปลี่ยนรูปภาพ' : 'ใช้ AI สแกนป้ายรถอัตโนมัติ'}</span>
                            <span className="text-xs text-slate-400 mt-1">คลิกที่นี่เพื่อถ่ายรูปรถ หรือเลือกจากอัลบั้ม</span>
                        </div>
                        )}
                        <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        onChange={handleImageChange}
                        disabled={result?.success || isSubmitting || isAnalyzing}
                        />
                    </label>

                    <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">ป้ายทะเบียน</label>
                            <input 
                            type="text" 
                            required={profileData?.isRegistered}
                            value={detectedPlate}
                            onChange={(e) => setDetectedPlate(e.target.value)}
                            placeholder="เช่น 1กข 1234"
                            disabled={result?.success || isSubmitting}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-[#06C755] focus:border-[#06C755] block p-2.5"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">จังหวัด</label>
                            <input 
                            type="text" 
                            value={detectedProvince}
                            onChange={(e) => setDetectedProvince(e.target.value)}
                            placeholder="เช่น กรุงเทพฯ"
                            disabled={result?.success || isSubmitting}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-[#06C755] focus:border-[#06C755] block p-2.5"
                            />
                        </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">สีรถ</label>
                            <input 
                            type="text" 
                            value={detectedColor}
                            onChange={(e) => setDetectedColor(e.target.value)}
                            placeholder="เช่น ขาว"
                            disabled={result?.success || isSubmitting}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-[#06C755] focus:border-[#06C755] block p-2.5"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">ประเภท</label>
                            <input 
                            type="text" 
                            value={detectedType}
                            onChange={(e) => setDetectedType(e.target.value)}
                            placeholder="เช่น รถยนต์, รถจักรยานยนต์"
                            disabled={result?.success || isSubmitting}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-[#06C755] focus:border-[#06C755] block p-2.5"
                            />
                        </div>
                        </div>
                    </div>
                    </div>
                    
                    {!profileData?.isRegistered && (
                        <div className="pt-2 border-t border-slate-200 mt-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1">รหัสเชิญ (Invite Code)</label>
                            <p className="text-xs text-slate-500 mb-2">หากหน่วยงานของคุณมีรหัสประจำสถานที่ กรุณากรอกรหัสที่คุณได้รับ</p>
                            <input 
                                type="text" 
                                disabled={result?.success || isSubmitting || isAnalyzing}
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                placeholder="เว้นว่างได้ หากคุณเป็นผู้ใช้บริการทั่วไป"
                                className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-[#06C755] focus:border-[#06C755] block p-3.5 transition-colors disabled:opacity-50 font-mono tracking-wider"
                            />
                        </div>
                    )}
                    
                    {!result?.success && (
                        <button 
                        type="submit" 
                        disabled={isSubmitting || isAnalyzing || (!profileData?.isRegistered && detectedPlate === '')}
                        className="w-full text-white bg-[#06C755] hover:bg-[#05b34c] focus:ring-4 focus:outline-none focus:ring-[#06C755]/30 font-bold rounded-xl text-md px-5 py-4 text-center mt-6 shadow-lg shadow-[#06C755]/20 disabled:opacity-50 transition-all flex justify-center items-center gap-2"
                        >
                        {isSubmitting ? (
                            <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {profileData?.isRegistered ? 'กำลังบันทึกรถ...' : 'กำลังเชื่อมข้อมูล...'}
                            </>
                        ) : (
                            profileData?.isRegistered ? 'บันทึกข้อมูลรถ' : 'ยืนยันการลงทะเบียน'
                        )}
                        </button>
                    )}
                  </form>
              </div>
          )}
        </div>
        </div>
      </div>
      <p className="text-center text-xs text-slate-400 mt-6 pb-6">PSS GO &copy; Powered by PSS</p>
    </div>
  );
}
