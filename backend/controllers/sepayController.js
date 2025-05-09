const axios = require('axios');

const SEPAY_API_URL = 'https://my.sepay.vn/userapi/transactions/list';
// Thử các endpoint phổ biến, bạn chỉ cần đổi lại nếu doc cung cấp endpoint khác
const SEPAY_LOGIN_URLS = [
  'https://my.sepay.vn/api/login',
  'https://my.sepay.vn/userapi/login',
  'https://my.sepay.vn/api/auth/login',
  'https://my.sepay.vn/userapi/auth/login'
];

exports.sepayLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Thiếu username hoặc password' });
    }

    const loginBody = { username, password };

    let lastError = null;
    for (const url of SEPAY_LOGIN_URLS) {
      try {
        const response = await axios.post(url, loginBody, {
          headers: { 'Content-Type': 'application/json' }
        });
        // Nếu trả về JSON có token, trả về luôn
        if (response.data && (response.data.token || response.data.access_token)) {
          return res.json({ token: response.data.token || response.data.access_token });
        }
        // Nếu trả về JSON nhưng không có token, thử endpoint tiếp theo
        if (typeof response.data === 'object') {
          lastError = { error: 'Không tìm thấy token trong response', detail: response.data };
          continue;
        }
        // Nếu trả về HTML, báo lỗi rõ ràng
        if (typeof response.data === 'string' && response.data.includes('<html')) {
          lastError = { error: 'Endpoint này trả về HTML, không phải API login', url };
          continue;
        }
      } catch (err) {
        lastError = { error: 'Lỗi khi gọi endpoint', url, detail: err?.response?.data || err.message };
        continue;
      }
    }
    // Nếu thử hết mà không thành công
    return res.status(400).json(lastError || { error: 'Không tìm thấy endpoint API login phù hợp' });
  } catch (error) {
    res.status(500).json({
      error: 'Lỗi đăng nhập SePay',
      detail: error?.response?.data || error.message
    });
  }
};

// Lấy giao dịch SePay bằng token (truyền từ frontend)
exports.getSepayTransactions = async (req, res) => {
  try {
    const token = req.headers['authorization']?.replace('Bearer ', '') || req.query.token;
    if (!token) {
      return res.status(401).json({ error: 'Thiếu API Token SePay, vui lòng nhập token.' });
    }
    // Lấy params filter/search/pagination từ query
    const {
      date_from,
      date_to,
      status,
      bankName,
      search,
      page = 1,
      pageSize = 10
    } = req.query;

    // Gọi trực tiếp SePay API với token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    // Có thể truyền params nếu SePay hỗ trợ filter/pagination
    const response = await axios.get(SEPAY_API_URL, { headers });
    if (response.data && response.data.transactions) {
      res.json({ data: response.data.transactions, total: response.data.transactions.length });
    } else {
      res.json({ data: [], total: 0 });
    }
  } catch (error) {
    res.status(error?.response?.status || 500).json({
      error: 'Lỗi khi lấy giao dịch SePay',
      detail: error?.response?.data || error.message
    });
  }
}; 