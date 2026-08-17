import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, SkipForward, Play } from 'lucide-react';
import { useTour, TOUR_STEPS } from '../../context/TourContext';

// Hook untuk mendapatkan posisi elemen target
function useTargetRect(targetSelector) {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    if (!targetSelector) {
      setRect(null);
      return;
    }

    const updateRect = () => {
      const el = document.querySelector(targetSelector);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height,
          right: r.right,
          bottom: r.bottom,
        });
        // Scroll ke elemen jika perlu
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        setRect(null);
      }
    };

    // Delay singkat agar DOM siap
    const timer = setTimeout(updateRect, 150);
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [targetSelector]);

  return rect;
}

// Komponen Tooltip Posisi Dinamis
function TourTooltip({ step, stepIndex, totalSteps, targetRect, onNext, onPrev, onSkip }) {
  const PADDING = 16;
  const TOOLTIP_WIDTH = 340;
  const ARROW_SIZE = 8;

  const getTooltipStyle = () => {
    if (!targetRect || step.placement === 'center') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: TOOLTIP_WIDTH,
        zIndex: 10001,
      };
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let top, left;

    switch (step.placement) {
      case 'right':
        top = targetRect.top + targetRect.height / 2;
        left = targetRect.right + PADDING;
        if (left + TOOLTIP_WIDTH > vw) left = targetRect.left - TOOLTIP_WIDTH - PADDING;
        return {
          position: 'fixed',
          top,
          left,
          transform: 'translateY(-50%)',
          width: TOOLTIP_WIDTH,
          zIndex: 10001,
        };

      case 'left':
        top = targetRect.top + targetRect.height / 2;
        left = targetRect.left - TOOLTIP_WIDTH - PADDING;
        if (left < 0) left = targetRect.right + PADDING;
        return {
          position: 'fixed',
          top,
          left,
          transform: 'translateY(-50%)',
          width: TOOLTIP_WIDTH,
          zIndex: 10001,
        };

      case 'bottom':
        top = targetRect.bottom + PADDING;
        left = targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2;
        left = Math.max(PADDING, Math.min(left, vw - TOOLTIP_WIDTH - PADDING));
        if (top + 200 > vh) top = targetRect.top - 200 - PADDING;
        return {
          position: 'fixed',
          top,
          left,
          width: TOOLTIP_WIDTH,
          zIndex: 10001,
        };

      case 'top':
      default:
        top = targetRect.top - PADDING - 10;
        left = targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2;
        left = Math.max(PADDING, Math.min(left, vw - TOOLTIP_WIDTH - PADDING));
        return {
          position: 'fixed',
          top,
          left,
          transform: 'translateY(-100%)',
          width: TOOLTIP_WIDTH,
          zIndex: 10001,
        };
    }
  };

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;
  const isCentered = !targetRect || step.placement === 'center';

  return (
    <div
      style={getTooltipStyle()}
      className="tour-tooltip animate-tour-in"
    >
      {/* Header */}
      <div className="tour-tooltip-header">
        <div className="flex items-center gap-2">
          <span className="text-xl">{step.icon}</span>
          <h3 className="tour-tooltip-title">{step.title}</h3>
        </div>
        <button
          onClick={onSkip}
          className="tour-close-btn"
          title="Tutup tur"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="tour-tooltip-body">
        <p className="tour-tooltip-desc">{step.description}</p>
      </div>

      {/* Progress dots */}
      <div className="tour-progress-dots">
        {TOUR_STEPS.map((_, i) => (
          <div
            key={i}
            className={`tour-dot ${i === stepIndex ? 'active' : i < stepIndex ? 'done' : ''}`}
          />
        ))}
      </div>

      {/* Footer actions */}
      <div className="tour-tooltip-footer">
        <span className="tour-step-counter">
          {stepIndex + 1} / {totalSteps}
        </span>

        <div className="flex items-center gap-2">
          {!isFirst && (
            <button onClick={onPrev} className="tour-btn-secondary">
              <ChevronLeft className="w-3.5 h-3.5" />
              Kembali
            </button>
          )}

          {isFirst && (
            <button onClick={onSkip} className="tour-btn-skip">
              <SkipForward className="w-3.5 h-3.5" />
              Lewati
            </button>
          )}

          <button onClick={onNext} className="tour-btn-primary">
            {isLast ? (
              <>
                <span>Selesai!</span>
                <span>🎊</span>
              </>
            ) : (
              <>
                <span>{isFirst ? 'Mulai Tur' : 'Lanjut'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Komponen Spotlight — highlight elemen target
function Spotlight({ targetRect }) {
  if (!targetRect) return null;

  const PAD = 8;
  const x = targetRect.left - PAD;
  const y = targetRect.top - PAD;
  const w = targetRect.width + PAD * 2;
  const h = targetRect.height + PAD * 2;
  const r = 12;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const svgPath = `
    M 0 0
    H ${vw}
    V ${vh}
    H 0
    Z
    M ${x + r} ${y}
    H ${x + w - r}
    Q ${x + w} ${y} ${x + w} ${y + r}
    V ${y + h - r}
    Q ${x + w} ${y + h} ${x + w - r} ${y + h}
    H ${x + r}
    Q ${x} ${y + h} ${x} ${y + h - r}
    V ${y + r}
    Q ${x} ${y} ${x + r} ${y}
    Z
  `;

  return (
    <svg
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <path
        d={svgPath}
        fill="rgba(2, 6, 23, 0.72)"
        fillRule="evenodd"
      />
      {/* Glow border di sekitar elemen */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={r}
        ry={r}
        fill="none"
        stroke="#F59E0B"
        strokeWidth="2.5"
        opacity="0.9"
      />
    </svg>
  );
}

// Komponen Utama Tour Overlay
export default function TourOverlay() {
  const {
    isActive,
    currentStep,
    currentStepData,
    totalSteps,
    nextStep,
    prevStep,
    skipTour,
  } = useTour();

  const targetRect = useTargetRect(
    isActive && currentStepData?.target ? currentStepData.target : null
  );

  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isActive]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') nextStep();
      if (e.key === 'ArrowLeft') prevStep();
      if (e.key === 'Escape') skipTour();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isActive, nextStep, prevStep, skipTour]);

  if (!isActive || !currentStepData) return null;

  const isCentered = !currentStepData.target || currentStepData.placement === 'center';

  return (
    <>
      {/* Overlay backdrop (untuk step centered) */}
      {isCentered && (
        <div
          className="tour-backdrop"
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {/* Spotlight SVG untuk step dengan target */}
      {!isCentered && <Spotlight targetRect={targetRect} />}

      {/* Clickable overlay (hanya untuk step dengan target) */}
      {!isCentered && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            pointerEvents: 'all',
            cursor: 'default',
          }}
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {/* Tooltip */}
      <TourTooltip
        step={currentStepData}
        stepIndex={currentStep}
        totalSteps={totalSteps}
        targetRect={!isCentered ? targetRect : null}
        onNext={nextStep}
        onPrev={prevStep}
        onSkip={skipTour}
      />
    </>
  );
}
