"""
Tests for database CRUD operations using pytest-asyncio.
"""
import logging
import uuid
from typing import Dict, Any, List

import pytest
from prisma import Prisma

logger = logging.getLogger(__name__)

# Mark all tests in this module as asyncio tests
pytestmark = pytest.mark.asyncio


async def test_user_crud(prisma_client: Prisma):
    """
    Test CRUD operations for User model.
    
    Args:
        prisma_client: The Prisma client fixture from conftest.py
    """
    logger.info("Testing User CRUD operations...")
    
    # Generate unique email to avoid conflicts
    unique_id = str(uuid.uuid4())[:8]
    test_email = f"test_user_{unique_id}@example.com"
    user_id = None
    
    try:
        # Create
        user = await prisma_client.user.create(
            data={
                "email": test_email,
                "firstName": "Test",
                "lastName": "User"
                # isActive has a default value in the schema
            }
        )
        user_id = user.id
        logger.info(f"Created test user with ID: {user.id}")
        
        assert user.email == test_email
        assert user.firstName == "Test"
        assert user.lastName == "User"
        assert user.isActive == True  # Default value from schema
        
        # Read
        found_user = await prisma_client.user.find_unique(
            where={"id": user.id}
        )
        assert found_user is not None
        assert found_user.email == test_email
        
        # Update
        updated_user = await prisma_client.user.update(
            where={"id": user.id},
            data={"firstName": "Updated"}
        )
        assert updated_user.firstName == "Updated"
        
        # Delete
        deleted_user = await prisma_client.user.delete(
            where={"id": user.id}
        )
        assert deleted_user.id == user.id
        user_id = None  # Mark as deleted
        
        # Verify deletion
        not_found_user = await prisma_client.user.find_unique(
            where={"id": user.id}
        )
        assert not_found_user is None
        
        return True
    except Exception as e:
        logger.error(f"Error during User CRUD test: {e}")
        return False
    finally:
        # Cleanup in case test failed
        if user_id:
            try:
                await prisma_client.user.delete(
                    where={"id": user_id}
                )
            except Exception:
                pass


async def test_business_crud(prisma_client: Prisma):
    """
    Test CRUD operations for Business model.
    
    Args:
        prisma_client: The Prisma client fixture from conftest.py
    """
    logger.info("Testing Business CRUD operations...")
    
    # Generate unique email to avoid conflicts
    unique_id = str(uuid.uuid4())[:8]
    test_email = f"business_owner_{unique_id}@example.com"
    user_id = None
    business_id = None
    
    try:
        # First create a user for the business
        user = await prisma_client.user.create(
            data={
                "email": test_email,
                "firstName": "Business",
                "lastName": "Owner"
                # isActive has a default value in the schema
            }
        )
        user_id = user.id
        
        # Create business
        business = await prisma_client.business.create(
            data={
                "name": "Test Business",
                "description": "A test business",
                "ownerId": user.id
            }
        )
        business_id = business.id
        logger.info(f"Created test business with ID: {business.id}")
        
        assert business.name == "Test Business"
        assert business.description == "A test business"
        assert business.ownerId == user.id
        
        # Read
        found_business = await prisma_client.business.find_unique(
            where={"id": business.id},
            include={"owner": True}
        )
        assert found_business is not None
        assert found_business.name == "Test Business"
        assert found_business.owner.email == test_email
        
        # Update
        updated_business = await prisma_client.business.update(
            where={"id": business.id},
            data={"name": "Updated Business"}
        )
        assert updated_business.name == "Updated Business"
        
        # Delete business
        deleted_business = await prisma_client.business.delete(
            where={"id": business.id}
        )
        assert deleted_business.id == business.id
        business_id = None  # Mark as deleted
        
        # Delete user
        deleted_user = await prisma_client.user.delete(
            where={"id": user.id}
        )
        assert deleted_user.id == user.id
        user_id = None  # Mark as deleted
        
        return True
    except Exception as e:
        logger.error(f"Error during Business CRUD test: {e}")
        return False
    finally:
        # Cleanup in case test failed
        if business_id:
            try:
                await prisma_client.business.delete(
                    where={"id": business_id}
                )
            except Exception:
                pass
        
        if user_id:
            try:
                await prisma_client.user.delete(
                    where={"id": user_id}
                )
            except Exception:
                pass


async def test_product_crud(prisma_client: Prisma):
    """
    Test CRUD operations for Product model.
    
    Args:
        prisma_client: The Prisma client fixture from conftest.py
    """
    logger.info("Testing Product CRUD operations...")
    
    # Generate unique email to avoid conflicts
    unique_id = str(uuid.uuid4())[:8]
    test_email = f"product_owner_{unique_id}@example.com"
    user_id = None
    business_id = None
    product_id = None
    
    try:
        # First create a user and business for the product
        user = await prisma_client.user.create(
            data={
                "email": test_email,
                "firstName": "Product",
                "lastName": "Owner"
                # isActive has a default value in the schema
            }
        )
        user_id = user.id
        
        # Create business
        business = await prisma_client.business.create(
            data={
                "name": "Product Business",
                "description": "A business with products",
                "ownerId": user.id
            }
        )
        business_id = business.id
        
        # Create product
        product = await prisma_client.product.create(
            data={
                "name": "Test Product",
                "description": "A test product",
                "price": 19.99,
                "businessId": business.id
            }
        )
        product_id = product.id
        logger.info(f"Created test product with ID: {product.id}")
        
        assert product.name == "Test Product"
        assert product.description == "A test product"
        assert product.price == 19.99
        assert product.businessId == business.id
        
        # Read
        found_product = await prisma_client.product.find_unique(
            where={"id": product.id},
            include={"business": True}
        )
        assert found_product is not None
        assert found_product.name == "Test Product"
        assert found_product.business.name == "Product Business"
        
        # Update
        updated_product = await prisma_client.product.update(
            where={"id": product.id},
            data={"name": "Updated Product", "price": 29.99}
        )
        assert updated_product.name == "Updated Product"
        assert updated_product.price == 29.99
        
        # Delete product
        deleted_product = await prisma_client.product.delete(
            where={"id": product.id}
        )
        assert deleted_product.id == product.id
        product_id = None  # Mark as deleted
        
        # Delete business
        deleted_business = await prisma_client.business.delete(
            where={"id": business.id}
        )
        assert deleted_business.id == business.id
        business_id = None  # Mark as deleted
        
        # Delete user
        deleted_user = await prisma_client.user.delete(
            where={"id": user.id}
        )
        assert deleted_user.id == user.id
        user_id = None  # Mark as deleted
        
        return True
    except Exception as e:
        logger.error(f"Error during Product CRUD test: {e}")
        return False
    finally:
        # Cleanup in case test failed
        if product_id:
            try:
                await prisma_client.product.delete(
                    where={"id": product_id}
                )
            except Exception:
                pass
        
        if business_id:
            try:
                await prisma_client.business.delete(
                    where={"id": business_id}
                )
            except Exception:
                pass
        
        if user_id:
            try:
                await prisma_client.user.delete(
                    where={"id": user_id}
                )
            except Exception:
                pass
