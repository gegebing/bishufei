import os
import sys
import subprocess
import urllib.parse

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Setup output directory
OUTPUT_DIR = r"d:\work\bishufei\screenshots"
os.makedirs(OUTPUT_DIR, exist_ok=True)

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
if not os.path.exists(CHROME_PATH):
    CHROME_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

HTML_PATH = r"d:\work\bishufei\演示系统\c-app.html"

PAGES = [
    {"name": "01_home", "param": "tab=home", "title": "首页"},
    {"name": "02_orders", "param": "tab=orders", "title": "接单广场"},
    {"name": "03_learn", "param": "tab=learn", "title": "学习中心"},
    {"name": "04_mall", "param": "tab=mall", "title": "装备商城"},
    {"name": "05_mine", "param": "tab=mine", "title": "个人中心"},
    {"name": "06_course_detail", "param": "page=course-detail", "title": "技能培训课程大纲与0元免学费秒查二级页"},
    {"name": "07_caac_detail", "param": "page=caac-detail", "title": "民航CAAC执照考证排考与800元券立减二级页"},
    {"name": "08_uom_pilot_reg", "param": "page=uom-pilot-reg", "title": "民航UOM飞手实名登记二级页"},
    {"name": "09_uom_drone_reg", "param": "page=uom-drone-reg", "title": "民航UOM无人机一机一码登记二级页"},
    {"name": "10_repair_apply", "param": "page=repair-apply", "title": "维修服务报修与AI故障预诊断二级页"},
    {"name": "11_order_detail", "param": "page=order-detail", "title": "订单履约工作台与UOM步骤条二级页"},
    {"name": "12_repair_order", "param": "page=repair-order", "title": "维修工单进度跟踪二级页"},
    {"name": "13_accessories_mall", "param": "page=accessories-mall", "title": "官方配件与载荷商城二级页"},
    {"name": "14_product_detail", "param": "page=product-detail", "title": "商品详情与42项官方验机报告二级页"},
    {"name": "15_attendance_record", "param": "page=attendance-record", "title": "学时考勤打卡与人脸微表情抓拍二级页"},
    {"name": "16_select_pilot", "param": "page=select-pilot", "title": "需求方选飞手比选竞标二级页"},
    {"name": "17_pilot_profile", "param": "page=pilot-profile", "title": "飞手档案与CAAC执照卡片二级页"},
    {"name": "18_voucher_detail", "param": "page=voucher-detail", "title": "800元专属考证补贴券二级页"}
]

print(f"Using browser: {CHROME_PATH}")
print(f"Capturing {len(PAGES)} screenshots...")

for item in PAGES:
    out_file = os.path.join(OUTPUT_DIR, f"{item['name']}.png")
    # File URI
    norm_path = os.path.abspath(HTML_PATH).replace('\\', '/')
    target_url = f"file:///{norm_path}?{item['param']}"
    
    cmd = [
        CHROME_PATH,
        "--headless=new",
        "--hide-scrollbars",
        "--disable-gpu",
        "--virtual-time-budget=2000",
        "--force-device-scale-factor=2",
        "--window-size=500,1050",
        f"--screenshot={out_file}",
        target_url
    ]
    
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if os.path.exists(out_file):
        size_kb = os.path.getsize(out_file) / 1024
        print(f"[OK] {item['name']}: {size_kb:.1f} KB - {item['title']}")
    else:
        print(f"[FAIL] {item['name']}")

print("ALL SCREENSHOTS CAPTURED SUCCESSFULLY!")
