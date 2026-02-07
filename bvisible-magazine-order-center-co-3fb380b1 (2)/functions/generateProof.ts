import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { order_id, text_styles } = await req.json();

    if (!order_id) {
      return Response.json({ error: 'order_id is required' }, { status: 400 });
    }

    const orders = await base44.asServiceRole.entities.Order.filter({ order_id });
    if (!orders || orders.length === 0) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orders[0];

    let file_url;

    // Standard/Promo orders: Use template matching the brown design
    if (order.is_promo_order) {
      const styles = text_styles || order.text_styles || {};
      
      const prompt = `Create a magazine cover with this EXACT layout and design:

BACKGROUND:
- Solid brown/rust color (#8B4513 or similar warm brown)
- Clean, flat background - no patterns

TOP SECTION:
- "B.Visible" text at the very top
- Large, bold white text with thick black outline/stroke
- Prominent and easy to read

SCHOOL NAME (Below B.Visible):
- "${order.school_or_church || 'Graduate'}"
- White text with thick outlined/hollow style
- Large, bold lettering

PHOTO SECTION (Center):
- Large circular frame with GOLD/YELLOW border (thick border)
- Student photo inside the circle
- Clean circular crop

BOTTOM TEXT SECTION:
- Student name: "${order.student_name}"
- Large white text, bold and prominent

${order.headline_choice && order.headline_completion ? `- Headline text: "${order.headline_choice}"
- White text, smaller than name
- Career/profession text: "${order.headline_completion}"
- BRIGHT YELLOW/GOLD color - make it pop!` : `- Text: "Has Mastered The Trade Of..."
- White text
- Career: "${order.future_career || order.headline_completion || 'Graduate'}"
- BRIGHT YELLOW/GOLD color`}

${order.cash_app_tag ? `
VERY BOTTOM:
- "Support Me: $${order.cash_app_tag}"
- GREEN/TEAL color (#20D4AB)
- Smaller text at the bottom` : ''}

DESIGN REQUIREMENTS:
- Match the reference design EXACTLY
- Brown background (#8B4513)
- White text with thick outlines at top
- Gold circular photo frame (thick border)
- Yellow/gold career text
- Green support text at bottom
- Clean, professional magazine aesthetic
- All text clearly readable`;

      const imageUrls = order.main_photo_url ? [order.main_photo_url] : [];
      
      const { url: generatedImageUrl } = await base44.asServiceRole.integrations.Core.GenerateImage({
        prompt: prompt,
        existing_image_urls: imageUrls
      });

      file_url = generatedImageUrl;
    } 
    // Premium orders: Custom AI-generated design with selected background
    else {
      const styles = text_styles || order.text_styles || {};
      const backgroundDesign = order.background_design || 'design1';
      
      // Design-specific styling with actual background images
      const designStyles = {
        design1: {
          description: 'Sky Is My Launching Pad - Inspiring blue sky with dramatic clouds and sunbeams',
          backgroundImage: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694b7ea7341a2c7a3fb380b1/aa4903f40_B2GBackground-TheSkyIsMyLaunchingPad.jpg',
          accentColor: '#FFD700',
          textColor: '#FFFFFF'
        },
        design2: {
          description: 'Clean White - Professional clean white background with elegant simplicity',
          backgroundImage: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694b7ea7341a2c7a3fb380b1/a27ae9565_B2BBackground-CleanWhite.png',
          accentColor: '#FFD700',
          textColor: '#000000'
        },
        design3: {
          description: 'Big Money - Success-themed green money background representing wealth and achievement',
          backgroundImage: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694b7ea7341a2c7a3fb380b1/14fd7ce7c_B2GBackground-BigMoney.png',
          accentColor: '#F1C40F',
          textColor: '#FFFFFF'
        },
        design4: {
          description: 'Glamour Lights - Elegant golden bokeh lights creating a luxurious atmosphere',
          backgroundImage: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694b7ea7341a2c7a3fb380b1/c6c139540_B2GBackground-GlamourLights.png',
          accentColor: '#FFD700',
          textColor: '#FFFFFF'
        }
      };

      const selectedStyle = designStyles[backgroundDesign] || designStyles.design1;
      
      const prompt = `Create a professional magazine cover using this exact background template: ${selectedStyle.backgroundImage}

BACKGROUND - ${selectedStyle.description}:
- Use the provided background image as the base
- Maintain all existing elements from the background (B.Visible logo, branding, etc.)
- Professional magazine-quality aesthetic

LAYOUT:
- Magazine-style vertical portrait format (portrait orientation)
- Professional typography and layout
- Incorporate school colors: ${order.school_colors || 'Blue and Gold'} as accent highlights

TOP SECTION (VERY TOP):
- "B.Visible" in bold, prominent magazine masthead style at the very top of the cover
- Professional magazine logo treatment with large, clear lettering

UPPER SECTION:
- School/Church name: "${order.school_or_church || 'Graduate'}"
- Font: Bold, Size: ${styles.school_name?.fontSize || 120}px
- Color: ${styles.school_name?.color || order.school_colors || '#FF0000'}

CENTER:
- Large, prominent display of the student's photo
- Professional framing and effects

BOTTOM SECTION:
- Student name in large, bold text: "${order.student_name}"
- Font: Bold, Size: ${styles.student_name?.fontSize || 140}px
- Color: ${styles.student_name?.color || selectedStyle.textColor}

${order.headline_choice ? `- Headline: "${order.headline_choice}"
- Font: Bold, Size: ${styles.headline?.fontSize || 100}px
- Color: ${styles.headline?.color || selectedStyle.textColor}` : ''}

${order.headline_completion ? `- Career Goal: "${order.headline_completion}"
- Font: Bold, Size: ${styles.headline_completion?.fontSize || 110}px
- Color: ${styles.headline_completion?.color || selectedStyle.accentColor} (bright accent)` : ''}

${order.cash_app_tag_on_cover && order.cash_app_tag ? `- Cash App Tag: "Support Me: ${order.cash_app_tag}" in green at bottom` : ''}

DESIGN STYLE:
- Magazine cover aesthetic (like TIME or National Geographic)
- Professional and celebratory
- Use the provided background image
- School colors as accent highlights
- Clean, modern typography
- High-quality, polished look
- Preserve B.Visible branding from background
- ${selectedStyle.description}

PHOTO PLACEMENT:
- Student photo should be prominently featured in the center/lower-center area
- Circular or rectangular frame with professional border
- Photo should complement the background without covering important elements

Include the student's photo in the center if provided.`;

      const imageUrls = [selectedStyle.backgroundImage];
      if (order.main_photo_url) {
        imageUrls.push(order.main_photo_url);
      }
      
      const { url: generatedImageUrl } = await base44.asServiceRole.integrations.Core.GenerateImage({
        prompt: prompt,
        existing_image_urls: imageUrls
      });

      file_url = generatedImageUrl;
    }

    // Update order with proof URL and styles
    await base44.asServiceRole.entities.Order.update(order.id, {
      proof_url: file_url,
      text_styles: text_styles || order.text_styles || {},
      proof_status: 'pending_admin_review'
    });

    return Response.json({ 
      success: true, 
      proof_url: file_url 
    });

  } catch (error) {
    console.error('Proof generation failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});