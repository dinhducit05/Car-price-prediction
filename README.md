# Hệ thống dự đoán giá xe ô tô

Ứng dụng hỗ trợ ước tính giá xe bằng Machine Learning, sử dụng giao diện web để
thu thập thông tin xe và Flask API để gọi mô hình đã huấn luyện. Mô hình chính
hiện tại là `MLPRegressor`, được đóng gói cùng toàn bộ bước tiền xử lý trong một
Scikit-learn Pipeline.

## Chức năng chính

- Dự đoán giá xe từ 10 thuộc tính đầu vào.
- Gợi ý hãng xe và dòng xe dựa trên dữ liệu huấn luyện.
- Cho phép người dùng tự nhập hãng hoặc dòng xe ngoài danh sách gợi ý.
- Kiểm tra dữ liệu ở cả frontend và backend trước khi dự đoán.
- Hiển thị giá dự đoán và khoảng giá tham khảo theo triệu VNĐ.
- Notebook huấn luyện và so sánh Linear Regression, Random Forest,
  MLPRegressor bằng MAE, RMSE và R² trên cùng tập kiểm thử.

## Thuộc tính đầu vào

| Thuộc tính | Ý nghĩa | Ví dụ |
| --- | --- | --- |
| `brand` | Hãng xe | `Toyota` |
| `model` | Dòng xe | `Vios E CVT` |
| `model_year` | Năm sản xuất | `2022` |
| `mileage_km` | Số kilomet đã đi | `7552` |
| `fuel_type` | Loại nhiên liệu | `Gasoline` |
| `transmission` | Loại hộp số | `CVT` |
| `engine_size` | Dung tích động cơ, đơn vị lít | `1.5` |
| `body_type` | Kiểu thân xe | `Sedan` |
| `seats` | Số chỗ ngồi | `5` |
| `condition` | Tình trạng xe | `Used` |

## Công nghệ sử dụng

- Backend: Python, Flask, Pandas, Scikit-learn, Joblib.
- Frontend: HTML, Tailwind CSS, Alpine.js, Chart.js.
- Machine Learning: Pipeline, ColumnTransformer, OneHotEncoder,
  StandardScaler và MLPRegressor.
- Phân tích dữ liệu: Jupyter Notebook và Matplotlib.

## Cấu trúc dự án

```text
Du_doan_gia_xe/
├── backend/
│   ├── app.py                 # Flask API và web server
│   └── requirements.txt       # Thư viện Python
├── data/
│   └── cars.csv               # Dữ liệu xe
├── frontend/
│   ├── index.html             # Giao diện chính
│   └── assets/
│       ├── css/main.css
│       └── js/
│           ├── app.js
│           ├── car-images.js
│           └── evaluation-chart.js
├── models/
│   └── car_price_model.pkl    # Pipeline đã huấn luyện
├── notebooks/
│   └── train_model.ipynb      # Huấn luyện và so sánh mô hình
└── README.md
```

## Yêu cầu hệ thống

- Python 3.11 trở lên.
- `pip` và `venv`.
- Trình duyệt web hiện đại.

> Mô hình được lưu bằng Scikit-learn `1.7.1`. Cần sử dụng đúng phiên bản trong
> `backend/requirements.txt`; phiên bản khác có thể làm model không tải hoặc dự
> đoán sai.

## Cài đặt

### macOS hoặc Linux

Mở Terminal tại thư mục dự án và chạy:

```bash
cd /duong-dan-den/Du_doan_gia_xe
python3 -m venv venv
source venv/bin/activate
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
```

### Windows PowerShell

```powershell
cd C:\duong-dan-den\Du_doan_gia_xe
py -m venv venv
venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r backend\requirements.txt
```

Nếu PowerShell không cho phép kích hoạt virtual environment, chạy một lần:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Sau đó kích hoạt lại `venv`.

## Chạy ứng dụng

Sau khi kích hoạt virtual environment:

```bash
python backend/app.py
```

Mở trình duyệt tại:

```text
http://127.0.0.1:5000
```

Frontend được Flask phục vụ trực tiếp, vì vậy không cần chạy một web server khác.
Lần dự đoán đầu tiên có thể chậm hơn do server cần nạp model vào bộ nhớ; các lần
sau sử dụng model đã được cache.

## API

### Kiểm tra trạng thái

```http
GET /api/health
```

Phản hồi mẫu:

```json
{
  "status": "ok",
  "model_exists": true
}
```

### Lấy danh sách hãng xe

```http
GET /api/brands
```

Danh sách này được đọc trực tiếp từ encoder đã lưu trong model.

### Lấy dòng xe theo hãng

```http
GET /api/models?brand=Toyota
```

Phản hồi mẫu:

```json
{
  "brand": "Toyota",
  "models": ["Camry 2.0G", "Vios E CVT"]
}
```

### Dự đoán giá xe

```http
POST /api/predict
Content-Type: application/json
```

Body mẫu:

```json
{
  "brand": "Toyota",
  "model": "Vios E CVT",
  "model_year": 2022,
  "mileage_km": 7552,
  "fuel_type": "Gasoline",
  "transmission": "CVT",
  "engine_size": 1.5,
  "body_type": "Sedan",
  "seats": 5,
  "condition": "Used"
}
```

Phản hồi thành công:

```json
{
  "predicted_price_vnd": 527169763,
  "predicted_price_million": 527.17
}
```

Nếu thiếu hoặc nhập sai dữ liệu, API trả HTTP `400` cùng danh sách lỗi.

## Chạy notebook và huấn luyện lại model

Cài Jupyter nếu môi trường chưa có:

```bash
pip install jupyter matplotlib
jupyter notebook notebooks/train_model.ipynb
```

Chạy lần lượt các cell từ đầu xuống cuối. Notebook bao gồm:

1. Đọc và làm sạch dữ liệu.
2. Tách 10 feature và biến mục tiêu `price_vnd`.
3. Chia train/test theo tỷ lệ 80/20 với `random_state=42`.
4. Tiền xử lý dữ liệu số và dữ liệu phân loại.
5. Huấn luyện MLPRegressor.
6. Đánh giá MAE, RMSE và R².
7. Lưu model vào `models/car_price_model.pkl`.
8. So sánh Linear Regression, Random Forest và MLPRegressor trên cùng tập test.

Việc chạy phần so sánh ba mô hình có thể mất vài phút tùy cấu hình máy.

## Một số lỗi thường gặp

### Model báo lỗi khi tải

Kiểm tra phiên bản Scikit-learn:

```bash
python -c "import sklearn; print(sklearn.__version__)"
```

Kết quả cần là `1.7.1`. Nếu không đúng:

```bash
pip install --force-reinstall scikit-learn==1.7.1
```

### Không tìm thấy model

Đảm bảo file sau tồn tại:

```text
models/car_price_model.pkl
```

Có thể chạy lại notebook để tạo model mới.

### Cổng 5000 đang được sử dụng

Đổi cổng trong cuối file `backend/app.py`, ví dụ:

```python
app.run(host="127.0.0.1", port=5001, debug=True)
```

Sau đó mở `http://127.0.0.1:5001`.

## Lưu ý

Kết quả dự đoán chỉ mang tính tham khảo. Giá xe thực tế còn phụ thuộc vào lịch sử
bảo dưỡng, tai nạn, trang bị tùy chọn, khu vực giao dịch và biến động thị trường.
