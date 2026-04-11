from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, BackgroundTasks
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_ALGORITHM = "HS256"

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

# Email config (SMTP — works with GoDaddy Titan and most providers)
SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.titan.email")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER", "")        # your full email, e.g. support@zymly.in
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
CONTACT_EMAIL = os.environ.get("CONTACT_EMAIL", "support@zymly.in")


async def send_email_smtp(to: str, subject: str, html: str):
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.warning("SMTP_USER or SMTP_PASSWORD not set — skipping email notification")
        return
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = SMTP_USER
    msg["To"] = to
    msg.attach(MIMEText(html, "html"))
    def _send():
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, to, msg.as_string())
    await asyncio.to_thread(_send)

# Cookie security: use SameSite=None + Secure for cross-origin (prod) or Lax for local dev
IS_PRODUCTION = os.environ.get("ENVIRONMENT", "development").lower() == "production"

# Create the main app
app = FastAPI()

# Create routers
api_router = APIRouter(prefix="/api")
auth_router = APIRouter(prefix="/auth")
content_router = APIRouter(prefix="/content")
flavors_router = APIRouter(prefix="/flavors")
contact_router = APIRouter(prefix="/contact")
submissions_router = APIRouter(prefix="/submissions")

# ============== MODELS ==============

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class AdminResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str

class PageContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    page_name: str
    section: str
    title: Optional[str] = None
    subtitle: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    cta_text: Optional[str] = None
    cta_link: Optional[str] = None
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PageContentUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    cta_text: Optional[str] = None
    cta_link: Optional[str] = None

class Flavor(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    tagline: str
    description: str
    image_url: str
    color: str
    accent_color: str = ""
    benefits: List[str] = []
    tags: List[str] = []
    order: int = 0
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FlavorCreate(BaseModel):
    name: str
    tagline: str
    description: str
    image_url: str
    color: str
    accent_color: str = ""
    benefits: List[str] = []
    tags: List[str] = []
    order: int = 0
    is_active: bool = True

class FlavorUpdate(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    color: Optional[str] = None
    accent_color: Optional[str] = None
    benefits: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None

class ContactSubmission(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str

# ============== AUTH HELPERS ==============

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
        "type": "access"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.admins.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============== AUTH ENDPOINTS ==============

@auth_router.post("/login")
async def login(credentials: AdminLogin, response: Response):
    email = credentials.email.lower()
    user = await db.admins.find_one({"email": email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(user["id"], user["email"])
    refresh_token = create_refresh_token(user["id"])
    
    cookie_secure = IS_PRODUCTION
    cookie_samesite = "none" if IS_PRODUCTION else "lax"
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=cookie_secure, samesite=cookie_samesite, max_age=86400, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=cookie_secure, samesite=cookie_samesite, max_age=604800, path="/")
    
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"]
    }

@auth_router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out successfully"}

@auth_router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    return user

# ============== CONTENT ENDPOINTS ==============

@content_router.get("/", response_model=List[PageContent])
async def get_all_content():
    contents = await db.page_content.find({}, {"_id": 0}).to_list(100)
    return contents

@content_router.get("/{page_name}")
async def get_page_content(page_name: str):
    contents = await db.page_content.find({"page_name": page_name}, {"_id": 0}).to_list(50)
    return contents

@content_router.put("/{content_id}")
async def update_content(content_id: str, update: PageContentUpdate, user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.page_content.update_one({"id": content_id}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Content not found")
    updated = await db.page_content.find_one({"id": content_id}, {"_id": 0})
    return updated

# ============== FLAVORS ENDPOINTS ==============

@flavors_router.get("/", response_model=List[Flavor])
async def get_flavors():
    flavors = await db.flavors.find({}, {"_id": 0}).sort("order", 1).to_list(50)
    return flavors

@flavors_router.get("/active")
async def get_active_flavors():
    flavors = await db.flavors.find({"is_active": True}, {"_id": 0}).sort("order", 1).to_list(50)
    return flavors

@flavors_router.post("/", response_model=Flavor)
async def create_flavor(flavor: FlavorCreate, user: dict = Depends(get_current_user)):
    flavor_obj = Flavor(**flavor.model_dump())
    doc = flavor_obj.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.flavors.insert_one(doc)
    return flavor_obj

@flavors_router.put("/{flavor_id}")
async def update_flavor(flavor_id: str, update: FlavorUpdate, user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    result = await db.flavors.update_one({"id": flavor_id}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Flavor not found")
    updated = await db.flavors.find_one({"id": flavor_id}, {"_id": 0})
    return updated

@flavors_router.delete("/{flavor_id}")
async def delete_flavor(flavor_id: str, user: dict = Depends(get_current_user)):
    result = await db.flavors.delete_one({"id": flavor_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Flavor not found")
    return {"message": "Flavor deleted"}

# ============== CONTACT ENDPOINTS ==============

@contact_router.post("/submit")
async def submit_contact(form: ContactForm, background_tasks: BackgroundTasks):
    submission = ContactSubmission(**form.model_dump())
    doc = submission.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.contact_submissions.insert_one(doc)

    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2B3033;">New Contact Form Submission</h2>
        <div style="background: #F2EFE8; padding: 20px; border-radius: 8px;">
            <p><strong>Name:</strong> {form.name}</p>
            <p><strong>Email:</strong> {form.email}</p>
            <p><strong>Phone:</strong> {form.phone or 'Not provided'}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">{form.message}</p>
        </div>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Sent from Zymly Website Contact Form
        </p>
    </div>
    """
    background_tasks.add_task(send_email_smtp, CONTACT_EMAIL, f"New Contact: {form.name}", html_content)

    return {"message": "Thank you for contacting us! We'll get back to you soon."}

# ============== SUBMISSIONS ENDPOINTS (Admin) ==============

@submissions_router.get("/")
async def get_submissions(user: dict = Depends(get_current_user)):
    submissions = await db.contact_submissions.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return submissions

@submissions_router.put("/{submission_id}/read")
async def mark_as_read(submission_id: str, user: dict = Depends(get_current_user)):
    result = await db.contact_submissions.update_one({"id": submission_id}, {"$set": {"is_read": True}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"message": "Marked as read"}

@submissions_router.delete("/{submission_id}")
async def delete_submission(submission_id: str, user: dict = Depends(get_current_user)):
    result = await db.contact_submissions.delete_one({"id": submission_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"message": "Submission deleted"}

# ============== ROOT ENDPOINT ==============

@api_router.get("/")
async def root():
    return {"message": "Zymly API is running"}

@api_router.get("/health")
async def health():
    return {"status": "ok"}

@api_router.get("/test-email")
async def test_email():
    """Admin-only: test SMTP configuration and return detailed error if it fails."""
    if not SMTP_USER or not SMTP_PASSWORD:
        return {"status": "error", "message": "SMTP_USER or SMTP_PASSWORD not set in environment"}
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Zymly SMTP Test"
        msg["From"] = SMTP_USER
        msg["To"] = CONTACT_EMAIL
        msg.attach(MIMEText("<p>SMTP is working correctly.</p>", "html"))
        def _send():
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
                server.ehlo()
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_USER, CONTACT_EMAIL, msg.as_string())
        await asyncio.to_thread(_send)
        return {"status": "success", "message": f"Test email sent to {CONTACT_EMAIL}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Include routers
api_router.include_router(auth_router)
api_router.include_router(content_router)
api_router.include_router(flavors_router)
api_router.include_router(contact_router)
api_router.include_router(submissions_router)
app.include_router(api_router)

# CORS
allowed_origins_raw = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000"
)
allowed_origins = [o.strip() for o in allowed_origins_raw.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============== STARTUP ==============

@app.on_event("startup")
async def startup_event():
    # Create indexes
    await db.admins.create_index("email", unique=True)
    await db.page_content.create_index([("page_name", 1), ("section", 1)])
    await db.flavors.create_index("order")
    
    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@zymly.in").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "ZymlyAdmin2024!")
    existing = await db.admins.find_one({"email": admin_email}, {"_id": 0})
    
    if existing is None:
        admin_id = str(uuid.uuid4())
        hashed = hash_password(admin_password)
        await db.admins.insert_one({
            "id": admin_id,
            "email": admin_email,
            "password_hash": hashed,
            "name": "Zymly Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Admin user created: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.admins.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info(f"Admin password updated: {admin_email}")
    
    # Seed default page content
    default_content = [
        {"page_name": "home", "section": "hero", "title": "Naturally Fermented Goodness", "subtitle": "Probiotic Fizzy Beverages for Your Gut", "content": "Handcrafted with love, our probiotic drinks bring you the perfect blend of taste and health. 100% vegan, homemade, and good for your gut.", "image_url": "https://images.unsplash.com/photo-1496568934502-9e86936646be", "cta_text": "Explore Flavors", "cta_link": "/flavors"},
        {"page_name": "home", "section": "features", "title": "Why Zymly?", "content": "Homemade with care, 100% vegan ingredients, handcrafted flavors, and probiotics for optimal gut health."},
        {"page_name": "mission", "section": "main", "title": "Our Mission", "subtitle": "Bringing Health to Every Sip", "content": "At Zymly, we believe that good health starts in the gut. Our mission is to make naturally fermented probiotic beverages accessible to everyone, without compromising on taste or quality. We're committed to using only the finest natural ingredients, traditional fermentation methods, and sustainable practices to create drinks that nourish your body and delight your taste buds."},
        {"page_name": "mission", "section": "values", "title": "Our Values", "content": "Quality First: We never compromise on ingredients or process. Sustainability: Eco-friendly packaging and responsible sourcing. Community: Supporting local farmers and suppliers. Transparency: What you see is what you get - no hidden ingredients."},
        {"page_name": "about", "section": "story", "title": "Our Story", "subtitle": "From Kitchen Experiments to Your Glass", "content": "Zymly started as a passion project in a small kitchen, where the love for traditional fermentation met modern health consciousness. What began as making probiotic drinks for friends and family has grown into a mission to share the goodness of naturally fermented beverages with everyone.", "image_url": "https://images.unsplash.com/photo-1683912568493-9a6a94aacfe3"},
        {"page_name": "about", "section": "team", "title": "The Team", "content": "We're a small but dedicated team of health enthusiasts, fermentation geeks, and flavor artists. Every bottle of Zymly is crafted with the same care and attention as the very first batch."},
        {"page_name": "contact", "section": "info", "title": "Get in Touch", "subtitle": "We'd Love to Hear From You", "content": "Have questions about our products, want to collaborate, or just want to say hi? Drop us a message and we'll get back to you as soon as possible."},
        {"page_name": "flavors", "section": "hero", "title": "Natural Flavors", "subtitle": "Our Collection", "content": "Each flavor is carefully crafted using the finest natural ingredients and traditional fermentation methods. Discover your perfect sip."},
        {"page_name": "flavors", "section": "grid", "title": "Explore All Flavors"},
    ]
    
    for content_data in default_content:
        exists = await db.page_content.find_one({"page_name": content_data["page_name"], "section": content_data["section"]})
        if not exists:
            content = PageContent(**content_data)
            doc = content.model_dump()
            doc["updated_at"] = doc["updated_at"].isoformat()
            await db.page_content.insert_one(doc)
    
    # Seed default flavors
    default_flavors = [
        {"name": "Simply Lemon", "tagline": "Pure Citrus Bliss", "description": "A refreshing burst of natural lemon with the perfect balance of tangy and sweet. Our classic flavor that started it all.", "image_url": "https://images.pexels.com/photos/12739023/pexels-photo-12739023.jpeg", "color": "#F4D03F", "accent_color": "#B8960A", "benefits": ["Rich in Vitamin C", "Aids Digestion", "Natural Energy Boost"], "tags": ["Bestseller", "Classic"], "order": 1},
        {"name": "Ginger Lemon", "tagline": "Zesty & Warming", "description": "The perfect marriage of zingy ginger and bright lemon. A warming combination that soothes and invigorates.", "image_url": "https://images.pexels.com/photos/10112136/pexels-photo-10112136.jpeg", "color": "#E67E22", "accent_color": "#A85A10", "benefits": ["Anti-inflammatory", "Immune Booster", "Digestive Aid"], "tags": ["Spicy", "Immunity"], "order": 2},
        {"name": "Cinne Pineapple", "tagline": "Tropical Spice Fusion", "description": "Sweet tropical pineapple meets warm cinnamon in this exotic blend. A taste of paradise with a cozy twist.", "image_url": "https://images.pexels.com/photos/8475719/pexels-photo-8475719.jpeg", "color": "#F1C40F", "accent_color": "#A87D00", "benefits": ["Metabolism Boost", "Blood Sugar Balance", "Tropical Goodness"], "tags": ["Tropical", "New"], "order": 3},
        {"name": "Tangy Orange", "tagline": "Sunshine in a Bottle", "description": "Bright, bold, and bursting with orange goodness. Like liquid sunshine for your gut.", "image_url": "https://images.pexels.com/photos/8475719/pexels-photo-8475719.jpeg", "color": "#E67E22", "accent_color": "#A85A10", "benefits": ["Vitamin C Rich", "Mood Lifter", "Refreshing"], "tags": ["Refreshing", "Summer"], "order": 4},
        {"name": "Berry Bliss", "tagline": "Berrylicious Delight", "description": "A medley of berries creating a symphony of flavors. Deep, rich, and packed with antioxidants.", "image_url": "https://images.pexels.com/photos/8475719/pexels-photo-8475719.jpeg", "color": "#E74C3C", "accent_color": "#9B1C1C", "benefits": ["Antioxidant Powerhouse", "Heart Healthy", "Brain Boost"], "tags": ["Antioxidant", "Fan Favourite"], "order": 5},
    ]
    
    for flavor_data in default_flavors:
        exists = await db.flavors.find_one({"name": flavor_data["name"]})
        if not exists:
            flavor = Flavor(**flavor_data)
            doc = flavor.model_dump()
            doc["created_at"] = doc["created_at"].isoformat()
            await db.flavors.insert_one(doc)
    
    logger.info("Startup complete - database seeded")
    

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
