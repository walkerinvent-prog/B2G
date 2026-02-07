import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Share2, Facebook, Twitter, Link as LinkIcon, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ShareButtons({ 
  url, 
  title, 
  description, 
  imageUrl,
  variant = "default",
  size = "default"
}) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url || window.location.href;
  const shareTitle = title || "B.Visible Magazine - Class of 2026";
  const shareText = description || "Check out this amazing graduate magazine career cover!";

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const shareToInstagram = () => {
    // Instagram doesn't support direct URL sharing, so copy link with instructions
    copyLink();
    toast.info('Link copied! Paste it in your Instagram story or bio', { duration: 5000 });
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      copyLink();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-[#1a1535] border-white/20">
        <DropdownMenuItem 
          onClick={shareToFacebook}
          className="cursor-pointer text-white hover:bg-white/10"
        >
          <Facebook className="w-4 h-4 mr-2 text-[#1877F2]" />
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={shareToTwitter}
          className="cursor-pointer text-white hover:bg-white/10"
        >
          <Twitter className="w-4 h-4 mr-2 text-[#1DA1F2]" />
          Share on Twitter
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={shareToInstagram}
          className="cursor-pointer text-white hover:bg-white/10"
        >
          <div className="w-4 h-4 mr-2 rounded bg-gradient-to-tr from-[#FCAF45] via-[#E1306C] to-[#833AB4]" />
          Copy for Instagram
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={copyLink}
          className="cursor-pointer text-white hover:bg-white/10"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-[#20D4AB]" />
              Link Copied!
            </>
          ) : (
            <>
              <LinkIcon className="w-4 h-4 mr-2 text-white/60" />
              Copy Link
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}