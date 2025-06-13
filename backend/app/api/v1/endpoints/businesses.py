from fastapi import APIRouter, Depends, HTTPException, status, Body, Response
from typing import Any, List
from datetime import datetime

from app.core.auth import get_current_user
from app.schemas.user import User
from app.schemas.business import Business, BusinessCreate, BusinessUpdate

router = APIRouter()

# Example responses for documentation
BUSINESS_EXAMPLE = {
    "id": "b12345",
    "name": "Acme Corp",
    "industry": "Technology",
    "description": "AI-powered business solutions",
    "owner_id": "u12345",
    "created_at": datetime.now().isoformat(),
    "updated_at": datetime.now().isoformat()
}

@router.post("/", response_model=Business, status_code=status.HTTP_201_CREATED,
          summary="Create Business",
          description="Create a new business for the authenticated user")
async def create_business(
    business: BusinessCreate = Body(
        ...,
        example={
            "name": "Acme Corp",
            "industry": "Technology",
            "description": "AI-powered business solutions"
        }
    ),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create a new business.
    
    - **name**: Business name (required)
    - **industry**: Business industry sector
    - **description**: Detailed description of the business
    
    Returns the created business object with a generated ID.
    """
    # Implementation will be added once database models are set up
    return {**business.model_dump(), "id": "example_business_id", "owner_id": current_user.id, 
            "created_at": datetime.now().isoformat(), "updated_at": datetime.now().isoformat()}

@router.get("/", response_model=List[Business],
         summary="List Businesses",
         description="Retrieve all businesses owned by the authenticated user with pagination support")
async def read_businesses(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Retrieve businesses owned by the current user.
    
    - **skip**: Number of businesses to skip (pagination offset)
    - **limit**: Maximum number of businesses to return (pagination limit)
    
    Returns a list of business objects owned by the authenticated user.
    """
    # Implementation will be added once database models are set up
    return [
        {
            "id": "b12345",
            "name": "Acme Corp",
            "industry": "Technology",
            "description": "AI-powered business solutions",
            "owner_id": current_user.id,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "b12346",
            "name": "TechStart",
            "industry": "Software",
            "description": "Software development services",
            "owner_id": current_user.id,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
    ]

@router.get("/{business_id}", response_model=Business,
         summary="Get Business",
         description="Get details of a specific business by ID")
async def read_business(
    business_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get a specific business by ID.
    
    - **business_id**: Unique identifier of the business to retrieve
    
    Returns the business object if found and owned by the authenticated user.
    Raises 404 if business not found or 403 if user doesn't have access.
    """
    # Implementation will be added once database models are set up
    # In a real implementation, we would check if the business exists and belongs to the user
    return {
        "id": business_id,
        "name": "Acme Corp",
        "industry": "Technology",
        "description": "AI-powered business solutions",
        "owner_id": current_user.id,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }

@router.put("/{business_id}", response_model=Business,
         summary="Update Business",
         description="Update an existing business by ID")
async def update_business(
    business_id: str,
    business: BusinessUpdate = Body(
        ...,
        example={
            "name": "Acme Corporation",
            "industry": "AI Technology",
            "description": "Advanced AI-powered business solutions"
        }
    ),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update a business.
    
    - **business_id**: Unique identifier of the business to update
    - **business**: Business data to update
      - name: Updated business name (optional)
      - industry: Updated business industry (optional)
      - description: Updated business description (optional)
    
    Returns the updated business object.
    Raises 404 if business not found or 403 if user doesn't have access.
    """
    # Implementation will be added once database models are set up
    # In a real implementation, we would check if the business exists and belongs to the user
    return {**business.model_dump(), "id": business_id, "owner_id": current_user.id,
            "created_at": datetime.now().isoformat(), "updated_at": datetime.now().isoformat()}

@router.delete("/{business_id}", status_code=status.HTTP_204_NO_CONTENT,
           summary="Delete Business",
           description="Delete an existing business by ID",
           response_class=Response)
async def delete_business(
    business_id: str,
    current_user: User = Depends(get_current_user)
) -> None:
    """
    Delete a business.
    
    - **business_id**: Unique identifier of the business to delete
    
    Returns no content (204) on successful deletion.
    Raises 404 if business not found or 403 if user doesn't have access.
    """
    # Implementation will be added once database models are set up
    # In a real implementation, we would check if the business exists and belongs to the user
    # For 204 responses, we don't return any content
