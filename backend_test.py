import requests
import sys
import json
from datetime import datetime

class ZymlyAPITester:
    def __init__(self, base_url="https://zymly-mission.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.session = requests.Session()  # Use session to maintain cookies
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, auth_required=False):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json() if response.content else {}
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Error: {response.text}")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "endpoint": endpoint
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e),
                "endpoint": endpoint
            })
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_admin_login(self, email="admin@zymly.in", password="ZymlyAdmin2024!"):
        """Test admin login and get token"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": email, "password": password}
        )
        if success and 'id' in response:
            # Store cookies for session-based auth
            print(f"   Logged in as: {response.get('name', 'Unknown')}")
            return True
        return False

    def test_get_me(self):
        """Test getting current user info"""
        return self.run_test("Get Current User", "GET", "auth/me", 200, auth_required=True)

    def test_get_all_content(self):
        """Test getting all page content"""
        return self.run_test("Get All Content", "GET", "content/", 200)

    def test_get_home_content(self):
        """Test getting home page content"""
        return self.run_test("Get Home Content", "GET", "content/home", 200)

    def test_get_contact_content(self):
        """Test getting contact page content"""
        return self.run_test("Get Contact Content", "GET", "content/contact", 200)

    def test_get_flavors(self):
        """Test getting all flavors"""
        success, response = self.run_test("Get All Flavors", "GET", "flavors/", 200)
        if success:
            print(f"   Found {len(response)} flavors")
            return True, response
        return False, []

    def test_get_active_flavors(self):
        """Test getting active flavors"""
        success, response = self.run_test("Get Active Flavors", "GET", "flavors/active", 200)
        if success:
            print(f"   Found {len(response)} active flavors")
            expected_flavors = ["Simply Lemon", "Ginger Lemon", "Cinne Pineapple", "Tangy Orange", "Berry Bliss"]
            found_flavors = [f['name'] for f in response]
            missing_flavors = [f for f in expected_flavors if f not in found_flavors]
            if missing_flavors:
                print(f"   ⚠️  Missing expected flavors: {missing_flavors}")
            return True, response
        return False, []

    def test_contact_form_submission(self):
        """Test contact form submission"""
        test_data = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "+91 9876543210",
            "message": "This is a test message from automated testing."
        }
        return self.run_test("Contact Form Submission", "POST", "contact/submit", 200, data=test_data)

    def test_get_submissions(self):
        """Test getting contact submissions (admin only)"""
        success, response = self.run_test("Get Contact Submissions", "GET", "submissions/", 200, auth_required=True)
        if success:
            print(f"   Found {len(response)} submissions")
            return True, response
        return False, []

    def test_create_flavor(self):
        """Test creating a new flavor (admin only)"""
        test_flavor = {
            "name": "Test Flavor",
            "tagline": "Test Tagline",
            "description": "This is a test flavor created during automated testing.",
            "image_url": "https://images.pexels.com/photos/8475719/pexels-photo-8475719.jpeg",
            "color": "#FF6B6B",
            "benefits": ["Test Benefit 1", "Test Benefit 2"],
            "order": 99,
            "is_active": True
        }
        success, response = self.run_test("Create Test Flavor", "POST", "flavors/", 201, data=test_flavor, auth_required=True)
        if success:
            return True, response.get('id')
        return False, None

    def test_update_content(self):
        """Test updating page content (admin only)"""
        # First get existing content
        success, contents = self.run_test("Get Content for Update", "GET", "content/home", 200)
        if success and contents:
            content_id = contents[0]['id']
            update_data = {
                "title": "Updated Title - Test"
            }
            return self.run_test("Update Content", "PUT", f"content/{content_id}", 200, data=update_data, auth_required=True)
        return False, {}

    def test_logout(self):
        """Test admin logout"""
        return self.run_test("Admin Logout", "POST", "auth/logout", 200)

def main():
    print("🚀 Starting Zymly API Testing...")
    print("=" * 50)
    
    tester = ZymlyAPITester()
    
    # Test public endpoints first
    print("\n📋 TESTING PUBLIC ENDPOINTS")
    print("-" * 30)
    
    tester.test_root_endpoint()
    tester.test_get_all_content()
    tester.test_get_home_content()
    tester.test_get_contact_content()
    
    flavors_success, flavors = tester.test_get_flavors()
    active_flavors_success, active_flavors = tester.test_get_active_flavors()
    
    tester.test_contact_form_submission()
    
    # Test admin authentication
    print("\n🔐 TESTING ADMIN AUTHENTICATION")
    print("-" * 30)
    
    login_success = tester.test_admin_login()
    if not login_success:
        print("❌ Admin login failed - skipping admin tests")
        print_results(tester)
        return 1
    
    tester.test_get_me()
    
    # Test admin endpoints
    print("\n👑 TESTING ADMIN ENDPOINTS")
    print("-" * 30)
    
    submissions_success, submissions = tester.test_get_submissions()
    
    # Test flavor management
    create_success, test_flavor_id = tester.test_create_flavor()
    
    # Test content management
    tester.test_update_content()
    
    # Clean up - delete test flavor if created
    if create_success and test_flavor_id:
        tester.run_test("Delete Test Flavor", "DELETE", f"flavors/{test_flavor_id}", 200, auth_required=True)
    
    tester.test_logout()
    
    # Print final results
    print_results(tester)
    
    return 0 if tester.tests_passed == tester.tests_run else 1

def print_results(tester):
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS")
    print("=" * 50)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {len(tester.failed_tests)}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    if tester.failed_tests:
        print("\n❌ FAILED TESTS:")
        for test in tester.failed_tests:
            error_msg = test.get('error', f"Expected {test.get('expected')}, got {test.get('actual')}")
            print(f"  - {test['test']}: {error_msg}")
    
    print("\n" + "=" * 50)

if __name__ == "__main__":
    sys.exit(main())