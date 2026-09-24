# VKU – Phát triển ứng dụng đa nền tảng
## BÁO CÁO KỸ THUẬT NGẮN – MINI-PROJECT

**Đề tài:** Mini-Project 2 – Real-time Study Room Booking App (ứng dụng đặt phòng học / phòng lab)
**Ngày:** 24/09/2026

---

## 1. Thông tin nhóm

| Mục | Nội dung |
|---|---|
| Tên nhóm | `TODO: điền` |
| Lớp | `TODO: điền` |

| # | Họ tên | MSSV | Vai trò | Đóng góp (%) |
|---|---|---|---|---|
| 1 | `TODO` | `TODO` | `TODO` | `TODO` |
| 2 | `TODO` | `TODO` | `TODO` | `TODO` |

> Họ tên, MSSV, vai trò, % đóng góp chưa có thông tin nên để trống có chủ đích.

---

## 2. Liên kết sản phẩm

| Mục | Liên kết |
|---|---|
| Mã nguồn (GitHub) | https://github.com/sunsanti/DNT_week6 |
| Live demo (GitHub Pages, cài được như PWA) | https://sunsanti.github.io/DNT_week6/ |
| File APK Android (GitHub Release) | https://github.com/sunsanti/DNT_week6/releases/latest (`room-booking-app.apk`, ~42 MB, ký debug) |
| Video demo | Không có |

---

## 3. Tổng quan

Ứng dụng giúp sinh viên tìm và đặt chỗ ngồi trong phòng học / phòng lab của trường. Người dùng đăng nhập, duyệt danh sách phòng, lọc theo trạng thái và loại phòng, chọn khung giờ, chọn ghế cụ thể, xem và hủy lượt đặt của mình, và nhận thông báo nhắc trước giờ bắt đầu 15 phút.

**Công nghệ sử dụng**

| Lớp | Công nghệ | Lý do chọn |
|---|---|---|
| Framework | React Native + Expo SDK 57 (managed workflow) | Một codebase cho Android, iOS và web; không cần cấu hình native thủ công |
| Ngôn ngữ | TypeScript (strict) | Bắt lỗi kiểu sớm, đặc biệt ở tham số điều hướng và model đặt chỗ |
| Điều hướng | React Navigation 7 (Bottom Tabs + Native Stack) | Chuẩn của hệ sinh thái RN; mỗi tab có stack riêng |
| State phía client | Zustand | Nhẹ, ít boilerplate, chọn state theo selector để tránh render thừa |
| State phía server | TanStack Query | Cache, trạng thái loading/error, invalidate sau khi đặt hoặc hủy |
| Tài khoản | Firebase Auth (email + mật khẩu) + Firestore | Có sẵn dịch vụ đăng nhập, không phải tự viết backend |
| Thông báo | expo-notifications (thông báo cục bộ) | Nhắc lịch không cần server |
| Kiểm thử | Jest + React Native Testing Library | Test logic thuần và component |
| Triển khai | GitHub Actions + GitHub Pages; Gradle (APK) | Tự động build web, APK build cục bộ |

---

## 4. Cấu trúc thư mục

```
room-booking-app/
├── App.tsx                     # Điểm vào: nạp font, theo dõi phiên đăng nhập, Toast
├── app.json / app.config.js    # Cấu hình Expo (tên app, package, baseUrl cho GitHub Pages)
├── firebase.json, firestore.rules   # Cấu hình Firebase + luật bảo mật (mỗi user chỉ đọc/ghi doc của mình)
├── .env.local                  # Khóa Firebase web (KHÔNG commit, đã .gitignore)
├── public/                     # File cho bản web/PWA: manifest, service worker, icon
├── assets/                     # Icon, splash của app
├── tests/                      # 46 unit/component test (Jest)
├── .github/workflows/deploy-web.yml   # CI: kiểm tra + build web + deploy GitHub Pages
└── src/
    ├── navigation/             # Điều hướng
    │   ├── RootNavigator.tsx   #   Chưa đăng nhập -> AuthStack, đã đăng nhập -> MainTabs
    │   ├── MainTabs.tsx        #   3 tab: Browse Rooms / My Bookings / Profile
    │   ├── BrowseRoomsStack.tsx, MyBookingsStack.tsx, ProfileStack.tsx, AuthStack.tsx
    │   └── types.ts            #   Kiểu tham số cho từng màn hình
    ├── screens/                # Các màn hình
    │   ├── auth/               #   LoginScreen, RegisterScreen
    │   ├── browse-rooms/       #   RoomListScreen -> RoomDetailScreen -> TimeSlotBookingScreen -> SeatSelectionScreen
    │   ├── my-bookings/        #   MyBookingsListScreen, BookingDetailScreen (hủy đặt)
    │   └── profile/            #   ProfileScreen (đăng xuất)
    ├── components/             # Thành phần UI tái sử dụng
    │   ├── RoomCard/           #   Thẻ phòng (memo) + skeleton loading
    │   └── FilterChip/, TimeSlotPicker/, SeatMap/, RoomInfo/, AuthForm/, Toast/, RoomIllustration/
    ├── store/                  # Zustand: useFilterStore, useBookingDraftStore, useSessionStore, useToastStore
    ├── services/
    │   ├── api/                #   Hook TanStack Query (useRooms, useCreateBooking, ...) + mock/db.ts (CSDL giả trong bộ nhớ)
    │   ├── firebase.ts, auth.ts#   Đăng ký / đăng nhập / phiên đăng nhập
    │   └── reminders.ts        #   Đặt lịch thông báo nhắc trước 15 phút
    ├── utils/                  # overlapCheck (chống trùng), applyFilters, generateDaySlots, reminderTime, ...
    ├── types/                  # Room, Booking, TimeSlot, FilterState
    └── hooks/, constants/      # useDebouncedValue, theme (màu sáng/tối, font, spacing)
```

---

## 5. Thiết kế kỹ thuật

### 5.1 Điều hướng

- `RootNavigator` chọn giữa hai nhánh dựa trên `useSessionStore`: chưa đăng nhập thì hiện `AuthStack` (Login, Register); đã đăng nhập thì hiện `MainTabs`.
- `NavigationContainer` có `key` đổi theo trạng thái đăng nhập, nên khi đăng nhập hoặc đăng xuất, stack được tạo mới và người dùng kế tiếp không thấy màn hình cũ của người trước.
- `MainTabs` có 3 tab, mỗi tab là một Native Stack riêng. Tab Browse Rooms gồm bốn màn hình nối tiếp: danh sách, chi tiết phòng, chọn khung giờ, chọn ghế.
- Tham số điều hướng được khai báo kiểu trong `navigation/types.ts`, ví dụ `SeatSelection` nhận `{ roomId, slot }`.

### 5.2 Quản lý state

| Store (Zustand) | Nội dung | Ghi chú |
|---|---|---|
| `useFilterStore` | Từ khóa tìm kiếm, chip trạng thái, chip loại phòng | Ô tìm kiếm dùng `useDebouncedValue` để giảm số lần lọc |
| `useBookingDraftStore` | `selectedSlot`, `seatIds` của lượt đặt đang soạn | Đổi khung giờ sẽ xóa ghế đã chọn; có `toggleSeat`, `clear` |
| `useSessionStore` | `user {id, name, email}`, cờ `initializing` | `initializing` giữ màn hình khởi động cho đến khi Firebase báo có phiên hay không |
| `useToastStore` | Nội dung toast | Hiển thị xác nhận / lỗi |

Dữ liệu phòng và lượt đặt **không** nằm trong Zustand mà đi qua TanStack Query (`useRooms`, `useRoom`, `useRoomBookings`, `useMyBookings`, `useCreateBooking`, `useCancelBooking`). Sau khi đặt hoặc hủy, các query liên quan bị invalidate để danh sách và số ghế cập nhật ngay.

### 5.3 Mô hình đặt chỗ và quy tắc chống trùng

- Mỗi lượt đặt (`Booking`) gắn với một phòng, một người dùng, một khung giờ và **danh sách ghế** `seatIds` (đánh số từ 0 trong dữ liệu, hiển thị cộng thêm 1).
- Một ghế chỉ bị chặn khi có lượt đặt đã xác nhận, giao nhau về thời gian, giữ đúng ghế đó. Hai khung giờ khác nhau không ảnh hưởng nhau.
- Số ghế còn lại của phòng = sức chứa trừ tổng số ghế đã xác nhận trong khung giờ (tính theo tổng, không theo từng ghế). Phòng được coi là "occupied" nếu dữ liệu gốc đánh dấu như vậy hoặc số ghế còn lại bằng 0; khi đó không thể đặt thêm.
- Một người dùng không thể giữ hai lượt đặt trùng giờ, kể cả ở hai phòng khác nhau.
- Các quy tắc nằm trong `utils/overlapCheck.ts` (`slotsOverlap`, `overlapCheck`, `takenSeatIds`, `seatsLeft`). UI dùng chúng để vô hiệu hóa ghế; `services/api/mock/db.ts` kiểm tra lại theo thứ tự: phòng occupied, người dùng trùng giờ, ghế hợp lệ / không trùng / trong phạm vi, ghế chưa bị lấy. Nếu vi phạm sẽ ném `BookingConflictError`. Nhờ vậy giao diện không phải là nơi duy nhất bảo vệ dữ liệu.

### 5.4 Luồng đặt chỗ (hai bước)

1. **Chọn khung giờ:** `TimeSlotBookingScreen` sinh các khung một giờ từ 8:00 đến 20:00 (`generateDaySlots`), mỗi ô hiển thị số ghế còn trống. Nút "Continue to seats" chỉ bật khi đã chọn giờ.
2. **Chọn ghế:** `SeatSelectionScreen` hiển thị "N of M seats left", sơ đồ ghế `SeatMap` (trống / đang chọn / đã bị đặt), và nút xác nhận có ghi số ghế.
3. Xác nhận gọi `useCreateBooking`, hiện toast, đặt lịch nhắc và quay về danh sách.

### 5.5 Hiệu năng danh sách

`RoomListScreen` dùng `FlatList` hai cột với `keyExtractor`; `RoomCard` được bọc `memo` nên chỉ render lại khi dữ liệu của chính thẻ đó đổi. Khi đang tải hiển thị `RoomCardSkeleton`. Việc này giảm render thừa theo thiết kế, nhưng chưa được đo bằng công cụ trên thiết bị thật (xem mục 8).

### 5.6 Tài khoản và Firebase

- Đăng ký, đăng nhập bằng email + mật khẩu qua Firebase Auth. Trên Android/iOS, phiên được lưu bằng AsyncStorage nên mở lại app vẫn đăng nhập; bản web dùng cơ chế mặc định của SDK.
- Khi đăng ký, tạo thêm tài liệu hồ sơ `users/{uid}` trong Firestore. Luật bảo mật `firestore.rules` chỉ cho phép người dùng đọc/ghi tài liệu của chính mình.
- Cấu hình Firebase web (không phải bí mật) được nạp từ biến môi trường `EXPO_PUBLIC_*` trong `.env.local` (đã `.gitignore`) và từ biến của repo khi build trên GitHub. Không có khóa service account nào nằm trong app.
- Kiểm tra phiên khi khởi động có giới hạn 4 giây (`SESSION_CHECK_TIMEOUT_MS`) để không treo nếu mạng chậm.
- Dữ liệu nhập được kiểm tra ở `utils/authValidation.ts`; mã lỗi Firebase được đổi thành thông báo dễ hiểu ở `utils/authErrors.ts`.

### 5.7 Thông báo nhắc lịch

- `services/reminders.ts` đặt thông báo cục bộ trước giờ bắt đầu 15 phút (`reminderTime`). Mã lượt đặt được dùng làm mã thông báo, nên hủy lượt đặt sẽ hủy luôn thông báo.
- Thư viện được `import()` lười trong `try/catch` và bị bỏ qua trên web và trong Expo Go (từ SDK 53, Expo Go trên Android không còn hỗ trợ push và ném lỗi khi import).
- Có xin quyền thông báo lúc chạy và tạo kênh thông báo trên Android.

### 5.8 Giao diện

- Bảng màu, font Inter, icon Phosphor, vùng chạm tối thiểu 44 px và hiệu ứng phản hồi khi nhấn được định nghĩa tập trung ở `constants/theme.ts`.
- Tự động chuyển sáng / tối theo hệ thống; có bản màu riêng cho từng chế độ, kể cả theme của React Navigation.
- Bản web bị giới hạn chiều rộng 480 px để giống điện thoại. Có `manifest.webmanifest` và service worker để cài như PWA.

### 5.9 Triển khai

- **Web:** workflow `.github/workflows/deploy-web.yml` chạy `npm ci`, `tsc`, Jest, `expo export -p web` với `EXPO_BASE_URL=/DNT_week6`, rồi đẩy lên GitHub Pages.
- **APK:** `expo prebuild` rồi build release bằng Gradle cục bộ (kiến trúc `arm64-v8a`), đính kèm vào GitHub Release. APK ký bằng khóa debug.

---

## 6. Danh sách tính năng

| Yêu cầu | Trạng thái | Ghi chú |
|---|---|---|
| Duyệt phòng, tìm kiếm + chip lọc (trạng thái, loại phòng) | Xong | `RoomListScreen`, state ở `useFilterStore` |
| Danh sách `FlatList`, thẻ phòng `memo` | Xong | Có skeleton khi tải. Chưa đo 60 fps trên máy thật. |
| Đặt 2 bước: khung giờ rồi ghế | Xong | Màn ghế hiển thị "N of M seats left" |
| Chống đặt trùng | Xong | Kiểm tra ở cả UI và tầng API (mock), xem mục 5.3 |
| State toàn cục bằng Zustand | Xong | filter, bản nháp đặt chỗ, phiên đăng nhập, toast |
| My Bookings + xem chi tiết + hủy đặt | Xong | Hiển thị phòng, tòa, tầng, ghế, giờ, trạng thái |
| Thông báo nhắc lịch (trước 15 phút) | Xong, chỉ app Android | Không chạy trên web hoặc Expo Go |
| Đăng ký / đăng nhập / giữ đăng nhập | Xong | Firebase Auth + hồ sơ Firestore |
| Dark mode + giao diện responsive | Xong | Theo giao diện hệ thống |
| Live demo cài được trên điện thoại | Xong | PWA GitHub Pages + APK |
| Cập nhật real-time giữa nhiều người dùng | **Chưa làm** | Phòng và lượt đặt nằm trong CSDL giả trong bộ nhớ |
| Lưu lượt đặt sau khi tắt app | **Chưa làm** | Cùng lý do trên |

---

## 7. Kiểm thử và kết quả

**Kiểm thử tự động:** `tsc --noEmit` không lỗi; 46 test Jest đều qua, gồm:

| Nhóm | Nội dung kiểm tra |
|---|---|
| `overlapCheck` | Khung giờ giao nhau / liền kề, ghế đã bị lấy, số ghế còn lại |
| `applyFilters` | Kết hợp từ khóa, trạng thái và loại phòng |
| Mock DB | Đặt trùng ghế, ghế ngoài phạm vi / lặp, người dùng trùng giờ, phòng occupied, hủy đặt |
| `authValidation` | Email và mật khẩu hợp lệ / không hợp lệ |
| `reminderTime` | Tính giờ nhắc |
| `watchSession` | Giới hạn 4 giây khi khởi động |
| `RoomCard`, `FilterChip` | Hiển thị và tương tác |

**Kiểm thử thủ công trên máy ảo Android (Pixel 8, APK release), ngày 24/09/2026:**

| Kịch bản | Kết quả |
|---|---|
| Đăng nhập bằng tài khoản Firebase thật | Vào được màn Browse Rooms |
| Lọc chip *Available* + *Lab* | Danh sách chỉ còn phòng lab đang trống |
| Chọn 16:00–17:00 tại Lab A3-101, chọn ghế 5, 6, 12 rồi xác nhận | Toast xác nhận; lượt đặt hiện ở My Bookings với đúng phòng, tòa, tầng, ghế, giờ |
| Mở lại chọn ghế của cùng khung giờ | Ghế 5, 6, 12 bị vô hiệu hóa; bộ đếm giảm từ 30 xuống 27 |
| Đặt Lab A3-102 khung 15:00–16:00, ghế 1 | Thông báo "Upcoming: Lab A3-102, Seat 1, 3:00 PM - 4:00 PM" xuất hiện |
| Bật giao diện tối của hệ thống | Toàn bộ màn hình đổi sang bảng màu tối |

Về thông báo: lịch được đặt lúc 14:45 (trước giờ đặt 15 phút) nhưng Android gửi lúc khoảng 14:49, vì hệ thống gộp các alarm không chính xác (`dumpsys alarm` cho thấy cửa sổ trễ khoảng 4,5 phút). Sai lệch vài phút này là hành vi của Android, không phải lỗi logic tính giờ.

---

## 8. Khó khăn và cách giải quyết

1. **Bàn phím che form (Android edge-to-edge).** Ở màn Đăng ký, bàn phím che các ô nhập và trang không cuộn được. Phát hiện khi test trên máy ảo. Đã sửa bằng form cuộn được đặt trong `KeyboardAvoidingView behavior="padding"`.
2. **APK build ra dùng sai cấu hình Firebase.** Gradle cache bản JS bundle và bỏ qua `.env.local` mới, nên APK vẫn dùng giá trị cũ. Đã ép build lại bundle (`createBundleReleaseJsAndAssets --rerun`) và kiểm tra bằng cách tìm project id trong bundle sau khi build.
3. **`expo-notifications` lỗi trong Expo Go.** Từ SDK 53, Expo Go trên Android ném lỗi khi import thư viện này. Đã import lười trong `try/catch` và bỏ qua trên web và Expo Go.
4. **Vòng quay khởi động treo.** Với phiên đăng nhập của tài khoản đã bị xóa và mạng chậm, app chờ Firebase quá lâu. Đã thêm giới hạn 4 giây kèm test.
5. **Gradient SVG biến mất khi các màn hình xếp chồng.** Do trùng `id` gradient giữa các instance. Đã tạo id riêng cho mỗi instance.
6. **Trạng thái "occupied" nhưng vẫn đặt được, và số ghế không giảm.** Đã đổi sang mô hình đặt theo ghế, tính số ghế còn lại từ tổng ghế đã xác nhận và chặn hoàn toàn phòng occupied.

---

## 9. Hạn chế và hướng phát triển

- **Dữ liệu phòng và lượt đặt chưa lưu bền và chưa real-time.** Cần chuyển sang Firestore (hoặc backend riêng) và dùng listener để nhiều người thấy cùng một trạng thái ghế.
- **Chưa đo hiệu năng.** Cần đo FPS của danh sách trên máy thật.
- **Thông báo có thể trễ vài phút** do Android gộp alarm không chính xác. Muốn đúng giờ hơn cần alarm chính xác (kèm quyền tương ứng).
- **APK ký debug.** Muốn phát hành cần khóa release riêng.
- **Chưa có bản iOS đã kiểm chứng.** Mã nguồn dùng Expo nên có thể build, nhưng chưa được thử trên thiết bị iOS.
