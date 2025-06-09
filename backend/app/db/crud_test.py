"""
Test script for basic CRUD operations with Prisma.
"""
import asyncio
import logging
from typing import Dict, Any, List

from prisma.models import User, Business, Product, Conversation, Message

from app.db.client import get_db

logger = logging.getLogger(__name__)


async def test_user_crud() -> bool:
    """
    Test CRUD operations for User model.
    
    Returns:
        bool: True if all operations successful, False otherwise
    """
    logger.info("Testing User CRUD operations...")
    
    try:
        async with get_db() as db:
            # Create
            test_email = "test_user@example.com"
            user = await db.user.create(
                data={
                    "email": test_email,
                    "firstName": "Test",
                    "lastName": "User",
                    "isActive": True
                }
            )
            logger.info(f"Created test user with ID: {user.id}")
            
            # Read
            fetched_user = await db.user.find_unique(where={"email": test_email})
            if not fetched_user or fetched_user.id != user.id:
                logger.error("Failed to fetch user by email")
                return False
            logger.info(f"Successfully fetched user: {fetched_user.id}")
            
            # Update
            updated_user = await db.user.update(
                where={"id": user.id},
                data={"firstName": "Updated"}
            )
            if updated_user.firstName != "Updated":
                logger.error("Failed to update user")
                return False
            logger.info(f"Successfully updated user: {updated_user.id}")
            
            # Delete
            deleted_user = await db.user.delete(where={"id": user.id})
            if not deleted_user:
                logger.error("Failed to delete user")
                return False
            logger.info(f"Successfully deleted user: {deleted_user.id}")
            
            return True
    except Exception as e:
        logger.error(f"Error during User CRUD test: {e}")
        return False


async def test_business_crud() -> bool:
    """
    Test CRUD operations for Business model.
    
    Returns:
        bool: True if all operations successful, False otherwise
    """
    logger.info("Testing Business CRUD operations...")
    
    try:
        async with get_db() as db:
            # First create a user for the business
            test_email = "business_owner@example.com"
            user = await db.user.create(
                data={
                    "email": test_email,
                    "firstName": "Business",
                    "lastName": "Owner",
                    "isActive": True
                }
            )
            
            # Create
            business = await db.business.create(
                data={
                    "name": "Test Business",
                    "description": "A test business",
                    "industry": "Technology",
                    "userId": user.id
                }
            )
            logger.info(f"Created test business with ID: {business.id}")
            
            # Read
            fetched_business = await db.business.find_unique(where={"id": business.id})
            if not fetched_business or fetched_business.id != business.id:
                logger.error("Failed to fetch business")
                return False
            logger.info(f"Successfully fetched business: {fetched_business.id}")
            
            # Update
            updated_business = await db.business.update(
                where={"id": business.id},
                data={"name": "Updated Business"}
            )
            if updated_business.name != "Updated Business":
                logger.error("Failed to update business")
                return False
            logger.info(f"Successfully updated business: {updated_business.id}")
            
            # Delete
            deleted_business = await db.business.delete(where={"id": business.id})
            if not deleted_business:
                logger.error("Failed to delete business")
                return False
            logger.info(f"Successfully deleted business: {deleted_business.id}")
            
            # Clean up user
            await db.user.delete(where={"id": user.id})
            
            return True
    except Exception as e:
        logger.error(f"Error during Business CRUD test: {e}")
        return False


async def test_product_crud() -> bool:
    """
    Test CRUD operations for Product model.
    
    Returns:
        bool: True if all operations successful, False otherwise
    """
    logger.info("Testing Product CRUD operations...")
    
    try:
        async with get_db() as db:
            # First create a user and business for the product
            user = await db.user.create(
                data={
                    "email": "product_owner@example.com",
                    "firstName": "Product",
                    "lastName": "Owner",
                    "isActive": True
                }
            )
            
            business = await db.business.create(
                data={
                    "name": "Product Business",
                    "industry": "Retail",
                    "userId": user.id
                }
            )
            
            # Create
            product = await db.product.create(
                data={
                    "name": "Test Product",
                    "description": "A test product",
                    "basePrice": 99.99,
                    "businessId": business.id
                }
            )
            logger.info(f"Created test product with ID: {product.id}")
            
            # Read
            fetched_product = await db.product.find_unique(where={"id": product.id})
            if not fetched_product or fetched_product.id != product.id:
                logger.error("Failed to fetch product")
                return False
            logger.info(f"Successfully fetched product: {fetched_product.id}")
            
            # Update
            updated_product = await db.product.update(
                where={"id": product.id},
                data={"name": "Updated Product"}
            )
            if updated_product.name != "Updated Product":
                logger.error("Failed to update product")
                return False
            logger.info(f"Successfully updated product: {updated_product.id}")
            
            # Delete
            deleted_product = await db.product.delete(where={"id": product.id})
            if not deleted_product:
                logger.error("Failed to delete product")
                return False
            logger.info(f"Successfully deleted product: {deleted_product.id}")
            
            # Clean up
            await db.business.delete(where={"id": business.id})
            await db.user.delete(where={"id": user.id})
            
            return True
    except Exception as e:
        logger.error(f"Error during Product CRUD test: {e}")
        return False


async def run_all_tests() -> Dict[str, bool]:
    """
    Run all CRUD tests and return results.
    
    Returns:
        Dict[str, bool]: Dictionary with test names and results
    """
    results = {
        "user": await test_user_crud(),
        "business": await test_business_crud(),
        "product": await test_product_crud()
    }
    
    logger.info("CRUD Test Results:")
    for test, result in results.items():
        status = "PASSED" if result else "FAILED"
        logger.info(f"  {test}: {status}")
    
    return results


def main():
    """
    Main function to run all tests.
    """
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    
    logger.info("Starting CRUD tests...")
    results = asyncio.run(run_all_tests())
    
    # Check if all tests passed
    all_passed = all(results.values())
    exit_code = 0 if all_passed else 1
    
    logger.info(f"All tests {'passed' if all_passed else 'failed'}")
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
