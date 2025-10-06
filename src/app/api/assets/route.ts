import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Query, CollectionReference } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const assetData = await request.json();
    
    // Validate required fields
    if (!assetData.basicData || !assetData.financialData || !assetData.operationsCompliance || !assetData.tierData) {
      return NextResponse.json(
        { error: 'Missing required form data' },
        { status: 400 }
      );
    }

    // Add timestamp and status
    const assetSubmission = {
      ...assetData,
      submittedAt: new Date(),
      status: 'pending',
      id: null // Will be set by Firestore
    };

    // Save to Firestore
    const docRef = await adminDb.collection('asset_submissions').add(assetSubmission);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Asset registration submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting asset registration:', error);
    return NextResponse.json(
      { error: 'Failed to submit asset registration' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let query: CollectionReference | Query = adminDb.collection('asset_submissions');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query.orderBy('submittedAt', 'desc').get();
    const assets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json({ assets });
  } catch (error) {
    console.error('Error fetching asset submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asset submissions' },
      { status: 500 }
    );
  }
}
