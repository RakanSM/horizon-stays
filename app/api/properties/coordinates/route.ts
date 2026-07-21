import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function PUT(req: NextRequest) {
  try {
    const { propertyId, latitude, longitude } = await req.json();

    if (!propertyId || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: propertyId, latitude, longitude' },
        { status: 400 }
      );
    }

    // Validate coordinates
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'Latitude and longitude must be numbers' },
        { status: 400 }
      );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinates: latitude must be -90 to 90, longitude must be -180 to 180' },
        { status: 400 }
      );
    }

    // Update property coordinates in Supabase
    const { data, error } = await supabase
      .from('properties')
      .update({ latitude, longitude })
      .eq('id', propertyId)
      .select('id, name, latitude, longitude')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to update property coordinates' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Property coordinates updated successfully',
      data,
    });
  } catch (error) {
    console.error('Error updating property coordinates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get('propertyId');

    if (propertyId) {
      const { data, error } = await supabase
        .from('properties')
        .select('id, name, latitude, longitude, base_price_night')
        .eq('id', propertyId)
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Property not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ data });
    }

    // Get all properties with coordinates
    const { data, error } = await supabase
      .from('properties')
      .select('id, name, latitude, longitude, base_price_night')
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
