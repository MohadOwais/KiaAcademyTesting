import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file received' },
        { status: 400 }
      );
    }

    // Here you would typically:
    // 1. Upload the file to your storage (e.g., S3, Cloudinary)
    // 2. Get the URL of the uploaded file
    // For this example, we'll just return a mock URL
    const mockUrl = `/uploads/${file.name}`;  // Replace with actual upload logic

    return NextResponse.json({ url: mockUrl });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
} 