import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { school_name, city } = await req.json();

    if (!school_name) {
      return Response.json({ error: 'School name is required' }, { status: 400 });
    }

    // Search for school information including logo
    const searchQuery = `${school_name} ${city || ''} school logo official website`;
    
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Search for information about "${school_name}" in ${city || 'the area'}. Find:
1. Official school logo image URL (high quality, transparent background preferred)
2. School website URL
3. School type (Public, Private, or Charter)
4. School mascot
5. School colors
6. A photo of the school building/campus

Return the information in JSON format. If you cannot find certain information, return null for those fields.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          logo_url: { type: "string" },
          website: { type: "string" },
          type: { type: "string" },
          mascot: { type: "string" },
          colors: { type: "string" },
          photo_url: { type: "string" },
          address: { type: "string" }
        }
      }
    });

    return Response.json({ 
      success: true,
      data: result
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});