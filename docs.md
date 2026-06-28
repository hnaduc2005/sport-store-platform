ĐẶC TẢ CHI TIẾT TỪNG USE CASE CHỨC NĂNG

Dưới đây là đặc tả chi tiết toàn bộ các Use Case chức năng của hệ thống, giúp dễ dàng mô hình hóa luồng hoạt động cho báo cáo.

### Nhóm 1: Chức năng Dành cho Khách hàng (Frontend)

#### 1. Đăng ký tài khoản
- **Tác nhân**: Khách hàng (Guest).
- **Mục tiêu**: Tạo tài khoản mới để có thể mua hàng, quản lý đơn hàng và giỏ hàng.
- **Điều kiện tiên quyết**: Khách truy cập chưa có tài khoản hoặc chưa đăng nhập.
- **Luồng hoạt động chính**:
    1. Khách hàng truy cập trang Đăng ký.
    2. Điền các thông tin yêu cầu: Họ tên, Email, Mật khẩu, Xác nhận mật khẩu.
    3. Nhấn nút "Đăng ký".
    4. Hệ thống kiểm tra tính hợp lệ của dữ liệu (Email chưa tồn tại, mật khẩu đủ mạnh).
    5. Hệ thống lưu tài khoản mới vào cơ sở dữ liệu và hiển thị thông báo thành công.

#### 2. Đăng nhập hệ thống
- **Tác nhân**: Khách hàng, Quản trị viên.
- **Mục tiêu**: Xác thực danh tính để truy cập vào các chức năng yêu cầu quyền hạn.
- **Điều kiện tiên quyết**: Đã có tài khoản trên hệ thống.
- **Luồng hoạt động chính**:
    1. Người dùng truy cập trang Đăng nhập.
    2. Nhập Email và Mật khẩu đã đăng ký.
    3. Nhấn "Đăng nhập".
    4. Hệ thống kiểm tra thông tin với dữ liệu trong CSDL.
    5. Nếu hợp lệ, hệ thống tạo phiên làm việc (session/token) và chuyển hướng tới Trang chủ (đối với Khách) hoặc Dashboard (đối với Admin).

#### 3. Cập nhật thông tin hồ sơ
- **Tác nhân**: Khách hàng.
- **Mục tiêu**: Cập nhật lại các thông tin cá nhân (địa chỉ, số điện thoại) để thuận tiện cho việc giao hàng sau này.
- **Điều kiện tiên quyết**: Khách hàng đã đăng nhập.
- **Luồng hoạt động chính**:
    1. Khách hàng truy cập trang "Hồ sơ cá nhân".
    2. Hệ thống hiển thị thông tin hiện tại của khách hàng.
    3. Khách hàng chỉnh sửa thông tin (Tên, Số điện thoại, Địa chỉ...).
    4. Nhấn "Lưu thay đổi".
    5. Hệ thống xác thực và cập nhật thông tin mới vào CSDL, thông báo thành công.

#### 4. Xem danh sách và chi tiết sản phẩm
- **Tác nhân**: Khách hàng.
- **Mục tiêu**: Tìm hiểu thông tin chi tiết về các sản phẩm đồ thể thao (giày, quần áo, dụng cụ...).
- **Điều kiện tiên quyết**: Không có.
- **Luồng hoạt động chính**:
    1. Khách hàng truy cập Trang chủ hoặc trang Danh sách Sản phẩm.
    2. Hệ thống lấy dữ liệu sản phẩm từ CSDL và hiển thị danh sách ảnh, tên, giá.
    3. Khách hàng click vào một sản phẩm cụ thể.
    4. Hệ thống hiển thị trang Chi tiết (Ảnh lớn, mô tả dài, thông số kỹ thuật, số lượng còn lại).

#### 5. Tìm kiếm và Lọc Sản phẩm
- **Tác nhân**: Khách hàng.
- **Mục tiêu**: Tìm kiếm chính xác sản phẩm mình muốn mua một cách nhanh chóng.
- **Điều kiện tiên quyết**: Không có.
- **Luồng hoạt động chính**:
    1. Khách hàng nhập từ khóa vào thanh tìm kiếm hoặc chọn bộ lọc (Danh mục sản phẩm, Khoảng giá).
    2. Nhấn tìm kiếm hoặc hệ thống tự lọc.
    3. Hệ thống gửi yêu cầu lên server, truy vấn và trả về danh sách sản phẩm khớp với tiêu chí.
    4. Khách hàng xem danh sách kết quả.

#### 6. Quản lý Giỏ hàng (Cart)
- **Tác nhân**: Khách hàng.
- **Mục tiêu**: Gom các món đồ cần mua lại để thanh toán cùng lúc.
- **Điều kiện tiên quyết**: Khách hàng đã đăng nhập.
- **Luồng hoạt động chính**:
    1. Tại trang chi tiết sản phẩm, khách hàng chọn số lượng và nhấn "Thêm vào giỏ".
    2. Hệ thống lưu sản phẩm vào giỏ hàng cá nhân của khách.
    3. Khách hàng vào xem "Giỏ hàng", hệ thống liệt kê danh sách các món đồ đã chọn.
    4. Khách hàng có thể tăng/giảm số lượng hoặc xóa sản phẩm khỏi giỏ.
    5. Hệ thống tính toán và tự động cập nhật lại Tổng tiền thanh toán.

#### 7. Đặt hàng và Thanh toán (Checkout)
- **Tác nhân**: Khách hàng.
- **Mục tiêu**: Hoàn tất giao dịch mua hàng.
- **Điều kiện tiên quyết**: Đã đăng nhập và có sản phẩm trong giỏ hàng.
- **Luồng hoạt động chính**:
    1. Tại Giỏ hàng, khách hàng nhấn "Tiến hành Thanh toán".
    2. Nhập/Xác nhận thông tin giao hàng (Tên, SĐT, Địa chỉ) và chọn Phương thức thanh toán.
    3. Nhấn "Xác nhận Đặt hàng".
    4. Hệ thống kiểm tra lại số lượng tồn kho của các sản phẩm trong giỏ.
    5. Hệ thống tạo Đơn hàng mới với trạng thái "Chờ xử lý", trừ đi số lượng tồn kho.
    6. Hệ thống làm rỗng giỏ hàng và hiển thị trang "Đặt hàng thành công".

#### 8. Xem lịch sử đơn hàng
- **Tác nhân**: Khách hàng.
- **Mục tiêu**: Theo dõi tình trạng của các đơn hàng đã đặt.
- **Điều kiện tiên quyết**: Khách hàng đã đăng nhập.
- **Luồng hoạt động chính**:
    1. Khách hàng vào menu "Đơn hàng của tôi".
    2. Hệ thống liệt kê tất cả đơn hàng lịch sử cùng với Trạng thái (Chờ xử lý, Đang giao, Đã hoàn thành, Đã hủy).
    3. Khách hàng nhấp vào từng đơn để xem chi tiết các sản phẩm bên trong đơn hàng đó.

---

### Nhóm 2: Chức năng Dành cho Quản trị viên (Admin Dashboard)

#### 1. Bảng điều khiển / Thống kê (Dashboard)
- **Tác nhân**: Quản trị viên.
- **Mục tiêu**: Nắm bắt nhanh tình hình kinh doanh, doanh thu, số đơn hàng mới.
- **Điều kiện tiên quyết**: Admin đã đăng nhập thành công.
- **Luồng hoạt động chính**:
    1. Admin truy cập Dashboard.
    2. Hệ thống tổng hợp dữ liệu từ CSDL.
    3. Hiển thị các biểu đồ và chỉ số: Tổng doanh thu, Tổng đơn hàng, Số lượng người dùng, Sản phẩm sắp hết hàng.

#### 2. Quản lý Danh mục (Categories)
- **Tác nhân**: Quản trị viên.
- **Mục tiêu**: Phân loại sản phẩm (VD: Giày chạy bộ, Phụ kiện bơi lội) để khách dễ tìm.
- **Điều kiện tiên quyết**: Admin đã đăng nhập thành công.
- **Luồng hoạt động chính**:
    1. Admin vào trang "Quản lý Danh mục".
    2. Xem danh sách danh mục.
    3. **Thêm**: Nhấn Thêm mới, nhập tên danh mục, mô tả -> Lưu.
    4. **Sửa/Xóa**: Chọn một danh mục hiện có để chỉnh sửa tên hoặc xóa bỏ.
    5. Hệ thống cập nhật thay đổi vào CSDL.

#### 3. Quản lý Sản phẩm (Products)
- **Tác nhân**: Quản trị viên.
- **Mục tiêu**: Duy trì kho hàng trên hệ thống (Thêm đồ mới, cập nhật giá).
- **Điều kiện tiên quyết**: Admin đã đăng nhập thành công.
- **Luồng hoạt động chính**:
    1. Admin vào "Quản lý Sản phẩm".
    2. **Thêm mới**: Điền thông tin (Tên, Hình ảnh, Giá, Số lượng tồn, Danh mục, Mô tả chi tiết) -> Nhấn Lưu.
    3. **Sửa**: Click vào sản phẩm để cập nhật lại giá hoặc số lượng.
    4. **Xóa/Ẩn**: Chuyển trạng thái sản phẩm để khách không thấy hoặc xóa hẳn.
    5. Hệ thống ghi nhận các cập nhật này xuống CSDL.

#### 4. Quản lý Đơn hàng (Orders)
- **Tác nhân**: Quản trị viên.
- **Mục tiêu**: Xử lý các đơn hàng khách vừa đặt để giao cho đơn vị vận chuyển.
- **Điều kiện tiên quyết**: Admin đã đăng nhập thành công.
- **Luồng hoạt động chính**:
    1. Admin vào "Quản lý Đơn hàng".
    2. Xem danh sách các đơn hàng (có thể lọc theo trạng thái "Chờ xử lý").
    3. Click vào đơn hàng để xem chi tiết thông tin người nhận và món hàng.
    4. Chuyển trạng thái đơn hàng (VD: từ "Chờ xử lý" sang "Đang giao hàng" hoặc "Đã hủy" nếu không liên hệ được khách).
    5. Hệ thống lưu lại trạng thái mới để khách hàng có thể cập nhật.

#### 5. Quản lý Người dùng (Users)
- **Tác nhân**: Quản trị viên.
- **Mục tiêu**: Quản lý tài khoản khách hàng, hỗ trợ chặn các hành vi xấu.
- **Điều kiện tiên quyết**: Admin đã đăng nhập thành công.
- **Luồng hoạt động chính**:
    1. Admin vào "Quản lý Người dùng".
    2. Hệ thống hiển thị danh sách tất cả tài khoản đã đăng ký.
    3. Admin tìm kiếm người dùng theo email hoặc tên.
    4. Admin có quyền Khóa (Ban) tài khoản đối với các khách hàng vi phạm chính sách hoặc Mở khóa lại.
    5. Hệ thống cập nhật trạng thái hoạt động (Active/Inactive) của tài khoản vào CSDL.
