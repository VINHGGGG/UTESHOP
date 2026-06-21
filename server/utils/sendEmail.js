// server/utils/sendEmail.js

const sendEmail = async (options) => {
  try {
    // 🔍 1. In ra dữ liệu đầu vào xem có bị rỗng (undefined) chỗ nào không
    console.log("==> KIỂM TRA DỮ LIỆU TRƯỚC KHI GỬI:", {
      to: options.email,
      subject: options.subject,
      sender: process.env.EMAIL_USERNAME
    });

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'UTEShop Support',
          email: process.env.EMAIL_USERNAME?.trim(), // Xóa khoảng trắng thừa nếu có
        },
        to: [
          {
            email: options.email?.trim(),
          },
        ],
        subject: options.subject || "Xác thực tài khoản UTEShop",
        htmlContent: options.message || "<p>No content</p>",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // 🌟 CHIẾN THUẬT: In toàn bộ vật thể lỗi mà Brevo trả về để xem cụ thể lỗi gì
      console.error("❌ CHI TIẾT LỖI TỪ HỆ THỐNG BREVO:", JSON.stringify(data, null, 2));
      throw new Error(data.message || 'Lỗi gửi mail từ hệ thống Brevo API');
    }

    console.log('🚀 Email đã gửi thành công qua Brevo API! ID:', data.messageId);
  } catch (error) {
    console.error('❌ LỖI HỆ THỐNG EMAIL:', error.message);
  }
};

export default sendEmail;