#   E m b e r   F r e s h 
 
 A   v i r t u a l   a s s i s t a n t   a p p l i c a t i o n   f o r   p a i n   t r a c k i n g   a n d   m a n a g e m e n t   w i t h   R a s a   A I   i n t e g r a t i o n . 
 
 # #   G e t t i n g   S t a r t e d 
 
 P l e a s e   r e f e r   t o   t h e   ` i n s t r u c t i o n S e r v e r . m d `   f i l e   f o r   d e t a i l e d   s e t u p   i n s t r u c t i o n s   f o r   a l l   c o m p o n e n t s   o f   t h e   a p p l i c a t i o n . 
 
 # #   R e p o s i t o r y   M a i n t e n a n c e 
 
 # # #   F i x i n g   G i t   L a r g e   F i l e   I s s u e s 
 
 I f   y o u ' r e   e x p e r i e n c i n g   i s s u e s   w i t h   l a r g e   f i l e s   b e i n g   t r a c k e d   b y   G i t   d e s p i t e   b e i n g   i n   . g i t i g n o r e ,   r u n   t h e   i n c l u d e d   c l e a n u p   s c r i p t : 
 
 ` ` ` b a s h 
 #   N a v i g a t e   t o   t h e   p r o j e c t   r o o t 
 c d   " D : \ R e d i r e c t i o n   s e s s i o n \ D o c u m e n t s \ D T I \ V i r t u a l A s s i s t a n t \ e m b e r - f r e s h " 
 
 #   R u n   t h e   c l e a n u p   s c r i p t 
 . / g i t - c l e a n . s h 
 
 #   A f t e r   r e v i e w i n g   t h e   c h a n g e s ,   c o m m i t   t h e m 
 g i t   c o m m i t   - m   " R e m o v e   l a r g e   d i r e c t o r i e s   f r o m   G i t   t r a c k i n g " 
 ` ` ` 
 
 T h e   s c r i p t   w i l l : 
 1 .   R e m o v e   ` n o d e _ m o d u l e s / `   d i r e c t o r i e s   f r o m   G i t   t r a c k i n g 
 2 .   R e m o v e   P y t h o n   v i r t u a l   e n v i r o n m e n t s   f r o m   G i t   t r a c k i n g 
 3 .   R e m o v e   R a s a   m o d e l   f i l e s   f r o m   G i t   t r a c k i n g 
 4 .   R e m o v e   l o g   f i l e s   f r o m   G i t   t r a c k i n g 
 5 .   R e m o v e   b u i l d   o u t p u t   f r o m   G i t   t r a c k i n g 
 
 T h i s   w i l l   m a k e   y o u r   G i t   o p e r a t i o n s   m u c h   f a s t e r   a n d   p r e v e n t   l a r g e   f i l e s   f r o m   b e i n g   i n c l u d e d   i n   c o m m i t s . 