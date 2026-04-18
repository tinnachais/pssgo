export async function sendLineMessage(toUserId: string, messages: any[]) {
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    
    if (!channelAccessToken) {
        console.warn("LINE_CHANNEL_ACCESS_TOKEN is not defined in .env.local. Skipping LINE push message.");
        return { success: false, error: "No Access Token" };
    }

    try {
        const response = await fetch("https://api.line.me/v2/bot/message/push", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${channelAccessToken}`
            },
            body: JSON.stringify({
                to: toUserId,
                messages: messages
            })
        });

        const data = await response.json();
        if (!response.ok) {
            console.error("LINE API Error:", data);
            return { success: false, error: data };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Send LINE Message failed:", error);
        return { success: false, error };
    }
}

// ตัวอย่างฟังก์ชันสร้างชุดข้อความ Flex Message แบบสวยงามสำหรับตอนผู้มาติดต่อเข้า
export function generateVisitorEntryFlexMessage(visitorName: string, licensePlate: string, imageUrl?: string, liffUrl?: string, siteName?: string, isAppointment: boolean = false) {
    return [
        {
            "type": "flex",
            "altText": isAppointment ? `แขกนัดหมายล่วงหน้ามาถึงแล้ว: ${licensePlate}` : `มีผู้มาติดต่อใหม่: ${licensePlate}`,
            "contents": {
                "type": "bubble",
                "header": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": isAppointment ? "📝 แขกนัดหมายล่วงหน้ามาถึงแล้ว!" : "🚗 ผู้มาติดต่อมาถึงแล้ว!",
                            "weight": "bold",
                            "color": isAppointment ? "#0ea5e9" : "#1DB446",
                            "size": "lg"
                        }
                    ],
                    "backgroundColor": isAppointment ? "#f0f9ff" : "#f0fdf4"
                },
                "hero": imageUrl ? {
                    "type": "image",
                    "url": imageUrl,
                    "size": "full",
                    "aspectRatio": "20:13",
                    "aspectMode": "cover"
                } : undefined,
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "spacing": "md",
                    "contents": [
                        {
                            "type": "text",
                            "text": `ทะเบียนรถ: ${licensePlate}`,
                            "weight": "bold",
                            "size": "xl"
                        },
                        {
                            "type": "text",
                            "text": `จุดประสงค์: ${visitorName}`,
                            "color": "#666666",
                            "wrap": true
                        },
                        ...(siteName ? [{
                            "type": "text",
                            "text": `โครงการ: ${siteName}`,
                            "color": "#888888",
                            "size": "sm",
                            "wrap": true
                        }] : []),
                        {
                            "type": "text",
                            "text": `เวลาเข้า: ${new Date().toLocaleTimeString("th-TH")}`,
                            "color": "#aaaaaa",
                            "size": "sm"
                        }
                    ]
                },
                "footer": liffUrl ? {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "button",
                            "style": "primary",
                            "color": "#2563eb",
                            "action": {
                                "type": "uri",
                                "label": "ประทับตรา E-Stamp",
                                "uri": liffUrl
                            }
                        }
                    ]
                } : undefined
            }
        }
    ];
}

// สร้างชุดข้อความ Flex Message แบบสวยงามสำหรับตอนผู้มาติดต่อออก
export function generateVisitorExitFlexMessage(visitorName: string, licensePlate: string, checkoutTime?: string, siteName?: string, imageUrl?: string, isAppointment: boolean = false) {
    return [
        {
            "type": "flex",
            "altText": isAppointment ? `แขกนัดหมายล่วงหน้าออกแล้ว: ${licensePlate}` : `ผู้มาติดต่อออกจากหมู่บ้านแล้ว: ${licensePlate}`,
            "contents": {
                "type": "bubble",
                "header": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": isAppointment ? "👋 แขกนัดหมายออกจากพื้นที่แล้ว" : "👋 ผู้มาติดต่อออกจากพื้นที่แล้ว",
                            "weight": "bold",
                            "color": isAppointment ? "#0ea5e9" : "#eab308",
                            "size": "lg"
                        }
                    ],
                    "backgroundColor": isAppointment ? "#f0f9ff" : "#fefce8"
                },
                "hero": imageUrl ? {
                    "type": "image",
                    "url": imageUrl,
                    "size": "full",
                    "aspectRatio": "20:13",
                    "aspectMode": "cover"
                } : undefined,
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "spacing": "md",
                    "contents": [
                        {
                            "type": "text",
                            "text": `ทะเบียนรถ: ${licensePlate}`,
                            "weight": "bold",
                            "size": "xl"
                        },
                        {
                            "type": "text",
                            "text": `จุดประสงค์: ${visitorName}`,
                            "color": "#666666",
                            "wrap": true
                        },
                        ...(siteName ? [{
                            "type": "text",
                            "text": `โครงการ: ${siteName}`,
                            "color": "#888888",
                            "size": "sm",
                            "wrap": true
                        }] : []),
                        {
                            "type": "text",
                            "text": `เวลาออก: ${checkoutTime || new Date().toLocaleTimeString("th-TH")}`,
                            "color": "#aaaaaa",
                            "size": "sm"
                        }
                    ]
                }
            }
        }
    ];
}

// สร้างชุดข้อความ Flex Message แบบสวยงามสำหรับตอนลูกบ้านเข้า/ออก
export function generateResidentFlexMessage(licensePlate: string, action: 'IN' | 'OUT', siteName?: string, imageUrl?: string) {
    const isEnter = action === 'IN';
    return [
        {
            "type": "flex",
            "altText": isEnter ? `รถลูกบ้านกลับเข้าโครงการ: ${licensePlate}` : `รถลูกบ้านออกจากโครงการ: ${licensePlate}`,
            "contents": {
                "type": "bubble",
                "header": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": isEnter ? "🏡 รถลูกบ้านเข้าโครงการ" : "👋 รถลูกบ้านออกจากโครงการ",
                            "weight": "bold",
                            "color": isEnter ? "#6366f1" : "#8b5cf6",
                            "size": "lg"
                        }
                    ],
                    "backgroundColor": isEnter ? "#eef2ff" : "#f5f3ff"
                },
                "hero": imageUrl ? {
                    "type": "image",
                    "url": imageUrl,
                    "size": "full",
                    "aspectRatio": "20:13",
                    "aspectMode": "cover"
                } : undefined,
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "spacing": "md",
                    "contents": [
                        {
                            "type": "text",
                            "text": `ทะเบียนรถ: ${licensePlate}`,
                            "weight": "bold",
                            "size": "xl"
                        },
                        ...(siteName ? [{
                            "type": "text",
                            "text": `โครงการ: ${siteName}`,
                            "color": "#888888",
                            "size": "sm",
                            "wrap": true
                        }] : []),
                        {
                            "type": "text",
                            "text": isEnter ? `เวลาเข้า: ${new Date().toLocaleTimeString("th-TH")}` : `เวลาออก: ${new Date().toLocaleTimeString("th-TH")}`,
                            "color": "#aaaaaa",
                            "size": "sm"
                        }
                    ]
                }
            }
        }
    ];
}
