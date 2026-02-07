import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createCanvas, loadImage } from 'npm:canvas@2.11.2';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { order_id } = await req.json();

    // Fetch order details
    const orders = await base44.entities.Order.filter({ order_id });
    if (!orders || orders.length === 0) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orders[0];

    // Magazine dimensions: 11" x 15" at 300 DPI = 3300 x 4500 pixels
    const width = 3300;
    const height = 4500;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Use promo template for promo orders, regular template otherwise
    const templateUrl = order.is_promo_order 
      ? 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694b7ea7341a2c7a3fb380b1/bcba52db3_90ab3a33-2d90-4d59-85d3-72c224667ef4.png'
      : 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694b7ea7341a2c7a3fb380b1/b96983166_Untitleddesign1.png';
    
    const template = await loadImage(templateUrl);
    ctx.drawImage(template, 0, 0, width, height);

    // Load and place student photo
    if (order.main_photo_url) {
      try {
        const studentPhoto = await loadImage(order.main_photo_url);
        
        if (order.is_promo_order) {
          // Promo template: circular frame in center
          const circleRadius = 900;
          const circleCenterX = width / 2;
          const circleCenterY = 1800;
          
          // Create circular clipping path
          ctx.save();
          ctx.beginPath();
          ctx.arc(circleCenterX, circleCenterY, circleRadius, 0, Math.PI * 2);
          ctx.clip();
          
          // Add school colors abstract splash background
          if (order.school_colors) {
            const colors = order.school_colors.split(/[,&/]/).map(c => c.trim());
            
            // Create abstract color splashes
            for (let i = 0; i < 8; i++) {
              const color = colors[i % colors.length];
              const splashRadius = Math.random() * 400 + 300;
              const splashX = circleCenterX + (Math.random() - 0.5) * circleRadius * 1.5;
              const splashY = circleCenterY + (Math.random() - 0.5) * circleRadius * 1.5;
              
              const gradient = ctx.createRadialGradient(
                splashX, splashY, 0,
                splashX, splashY, splashRadius
              );
              gradient.addColorStop(0, `${color}40`); // 25% opacity
              gradient.addColorStop(1, 'transparent');
              
              ctx.fillStyle = gradient;
              ctx.fillRect(
                circleCenterX - circleRadius,
                circleCenterY - circleRadius,
                circleRadius * 2,
                circleRadius * 2
              );
            }
          }
          
          // Calculate dimensions to fill circle
          const diameter = circleRadius * 2;
          let photoWidth = studentPhoto.width;
          let photoHeight = studentPhoto.height;
          const photoAspect = photoWidth / photoHeight;
          
          // Scale to cover the circle
          if (photoAspect > 1) {
            photoHeight = diameter;
            photoWidth = photoHeight * photoAspect;
          } else {
            photoWidth = diameter;
            photoHeight = photoWidth / photoAspect;
          }
          
          const photoX = circleCenterX - photoWidth / 2;
          const photoY = circleCenterY - photoHeight / 2;
          
          ctx.drawImage(studentPhoto, photoX, photoY, photoWidth, photoHeight);
          ctx.restore();
        } else {
          // Regular template: center area placement
          const photoMaxWidth = 2800;
          const photoMaxHeight = 3200;
          const photoX = 250;
          const photoY = 800;
          
          let photoWidth = studentPhoto.width;
          let photoHeight = studentPhoto.height;
          const photoAspect = photoWidth / photoHeight;
          
          if (photoWidth > photoMaxWidth) {
            photoWidth = photoMaxWidth;
            photoHeight = photoWidth / photoAspect;
          }
          if (photoHeight > photoMaxHeight) {
            photoHeight = photoMaxHeight;
            photoWidth = photoHeight * photoAspect;
          }
          
          const centeredX = photoX + (photoMaxWidth - photoWidth) / 2;
          const centeredY = photoY + (photoMaxHeight - photoHeight) / 2;
          
          ctx.drawImage(studentPhoto, centeredX, centeredY, photoWidth, photoHeight);
        }
      } catch (error) {
        console.error('Error loading student photo:', error);
      }
    }

    if (order.is_promo_order) {
      // Promo template text layout
      ctx.textAlign = 'center';
      
      // School name at top (red text with white outline)
      if (order.school_or_church) {
        ctx.fillStyle = '#FF0000';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 8;
        ctx.font = 'bold 110px Arial';
        ctx.strokeText(order.school_or_church, width / 2, 450);
        ctx.fillText(order.school_or_church, width / 2, 450);
      }
      
      // Student name (white, centered, below photo)
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 180px Arial';
      ctx.fillText(order.student_name || '', width / 2, 3100);

      // Headline choice (white, centered)
      if (order.headline_choice) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 90px Arial';
        ctx.fillText(order.headline_choice, width / 2, 3350);
      }

      // Headline completion (bright yellow: #FFD700, centered)
      if (order.headline_completion) {
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 120px Arial';
        ctx.fillText(order.headline_completion, width / 2, 3550);
      }

      // Cash App support text (green, centered, bottom)
      if (order.cash_app_tag) {
        ctx.fillStyle = '#00FF00';
        ctx.font = 'bold 70px Arial';
        ctx.fillText(`Support Me: $${order.cash_app_tag}`, width / 2, 3850);
      }
    } else {
      // Regular template text layout
      const leftMargin = 75;
      const textStartY = 850;
      ctx.textAlign = 'left';

      // School name (white, bold, large)
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 140px Arial';
      ctx.fillText(order.school_or_church || '', leftMargin, textStartY);

      // Student name - split if first or last name > 7 letters
      const nameParts = order.student_name.split(' ');
      let nameY = textStartY + 180;
      
      if (nameParts.length >= 2) {
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');
        
        if (firstName.length > 7 || lastName.length > 7) {
          ctx.fillStyle = '#FF0000';
          ctx.font = 'bold 160px Arial';
          ctx.fillText(firstName, leftMargin, nameY);
          ctx.fillText(lastName, leftMargin, nameY + 180);
          nameY += 360;
        } else {
          ctx.fillStyle = '#FF0000';
          ctx.font = 'bold 160px Arial';
          ctx.fillText(order.student_name, leftMargin, nameY);
          nameY += 180;
        }
      } else {
        ctx.fillStyle = '#FF0000';
        ctx.font = 'bold 160px Arial';
        ctx.fillText(order.student_name, leftMargin, nameY);
        nameY += 180;
      }

      // Headline choice
      if (order.headline_choice) {
        const headlineLines = order.headline_choice.split('\n');
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 100px Arial';
        
        headlineLines.forEach((line, index) => {
          ctx.fillText(line, leftMargin, nameY + (index * 120));
        });
        nameY += headlineLines.length * 120 + 20;

        if (order.headline_completion) {
          ctx.fillStyle = '#FFD700';
          ctx.font = 'bold 110px Arial';
          ctx.fillText(order.headline_completion, leftMargin, nameY + 120);
          nameY += 200;
        }
      }

      // Cash App tag in upper right
      if (order.cash_app_tag && order.cash_app_tag_on_cover) {
        ctx.fillStyle = '#CCFF00';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(order.cash_app_tag, 2900, 280);
      }

      // "A Dream Come True!" text
      ctx.fillStyle = '#FF0000';
      ctx.font = 'italic bold 120px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('A Dream Come True!', leftMargin, 4150);
    }

    // Convert canvas to buffer
    const buffer = canvas.toBuffer('image/png');

    // Upload generated cover
    const blob = new Blob([buffer], { type: 'image/png' });
    const file = new File([blob], `cover_${order_id}.png`, { type: 'image/png' });
    
    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    // Update order with generated cover URL
    await base44.asServiceRole.entities.Order.update(order.id, {
      magazine_cover_url: file_url
    });

    return Response.json({
      success: true,
      cover_url: file_url,
      message: 'Magazine cover generated successfully'
    });

  } catch (error) {
    console.error('Magazine cover generation failed:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});