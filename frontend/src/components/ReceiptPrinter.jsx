import React, { createContext, useContext } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { CheckCircle2, Loader2 } from 'lucide-react'

export const ReceiptPrinterContext = createContext(null)

const easeOut = [0.23, 1, 0.32, 1]
const easeInOut = [0.77, 0, 0.175, 1]

const receiptToothCount = 42
const receiptToothDepth = 4
const receiptToothPoints = Array.from(
  { length: receiptToothCount * 2 },
  (_, index) => {
    const x = 100 - ((index + 1) * 100) / (receiptToothCount * 2)
    const y = index % 2 === 0 ? "100%" : `calc(100% - ${receiptToothDepth}px)`
    return `${x}% ${y}`
  }
).join(", ")
export const receiptClipPath = `polygon(0 0, 100% 0, 100% calc(100% - ${receiptToothDepth}px), ${receiptToothPoints})`

const printingTransformKeyframes = [
  "translateY(calc(-100% + 2px))",
  "translateY(-91%)",
  "translateY(-91%)",
  "translateY(-81%)",
  "translateY(-81%)",
  "translateY(-70%)",
  "translateY(-70%)",
  "translateY(-58%)",
  "translateY(-58%)",
  "translateY(-45%)",
  "translateY(-45%)",
  "translateY(-32%)",
  "translateY(-32%)",
  "translateY(-20%)",
  "translateY(-20%)",
  "translateY(-10%)",
  "translateY(-10%)",
  "translateY(-3%)",
  "translateY(-3%)",
  "translateY(0%)",
]

const printingKeyframeTimes = [
  0, 0.075, 0.105, 0.18, 0.21, 0.285, 0.315, 0.39, 0.42, 0.495, 0.525, 0.6,
  0.63, 0.705, 0.735, 0.81, 0.84, 0.915, 0.945, 1,
]

const statusLabels = {
  processing: "Processing your order",
  printing: "Printing your receipt",
  complete: "Order complete",
}

export function useReceiptPrinter(component = 'ReceiptPrinter') {
  const context = useContext(ReceiptPrinterContext)
  if (!context) {
    throw new Error(`${component} must be used inside ReceiptPrinter.Root.`)
  }
  return context
}

export function ReceiptPrinterRoot({
  animate = true,
  children,
  className = '',
  feedMotion = "stepped",
  stage = "complete",
  ...props
}) {
  const shouldReduceMotion = useReducedMotion()
  const context = {
    animate,
    feedMotion,
    shouldMove: animate && !shouldReduceMotion,
    stage,
  }

  return (
    <ReceiptPrinterContext.Provider value={context}>
      <section
        aria-label="Receipt printer"
        className={`relative isolate flex w-full max-w-[410px] sm:max-w-[430px] flex-col items-center select-none ${className}`}
        data-stage={stage}
        {...props}
      >
        {children}
      </section>
    </ReceiptPrinterContext.Provider>
  )
}

export function ReceiptPrinterMachine({ children, className = '', ...props }) {
  return (
    <div
      className={`relative isolate w-full overflow-hidden rounded-[1.35rem] border border-gray-800 bg-[#191A20] p-3 pb-6 shadow-[0_18px_34px_-18px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_0_rgba(0,0,0,0.8)] ${className}`}
      {...props}
    >
      {children}
      {/* Printer paper exit slot */}
      <div
        aria-hidden="true"
        className="absolute inset-x-6 bottom-2.5 z-40 h-2 rounded-[0.25rem] border border-black bg-[#0B0C10] shadow-inner"
      />
    </div>
  )
}

export function ReceiptPrinterHeader({ children, className = '', ...props }) {
  return (
    <div
      className={`relative z-10 flex h-8 items-center justify-between px-1 mb-1.5 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function ReceiptPrinterScreen({ children, className = '', ...props }) {
  return (
    <div
      className={`relative z-10 isolate overflow-hidden rounded-xl border border-gray-900 bg-[#111216] p-3 text-white shadow-inner ${className}`}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export function StatusIndicator({ animate, move, stage }) {
  const isComplete = stage === "complete"

  return (
    <span
      aria-hidden="true"
      className="relative grid size-4 shrink-0 place-items-center"
    >
      <AnimatePresence initial={false} mode="sync">
        {isComplete ? (
          <motion.span
            animate={{ opacity: 1, transform: "scale(1)" }}
            className="col-start-1 row-start-1 grid place-items-center text-emerald-400"
            exit={{
              opacity: animate ? 0 : 1,
              transform: move ? "scale(0.96)" : "scale(1)",
            }}
            initial={{
              opacity: animate ? 0 : 1,
              transform: move ? "scale(0.94)" : "scale(1)",
            }}
            key="complete"
            transition={{ duration: animate ? 0.16 : 0, ease: easeOut }}
          >
            <CheckCircle2 className="w-4 h-4" />
          </motion.span>
        ) : (
          <motion.span
            animate={{ opacity: 1, transform: "scale(1)" }}
            className="col-start-1 row-start-1 grid place-items-center text-gray-400"
            exit={{
              opacity: animate ? 0 : 1,
              transform: move ? "scale(0.96)" : "scale(1)",
            }}
            initial={{
              opacity: animate ? 0 : 1,
              transform: move ? "scale(0.94)" : "scale(1)",
            }}
            key="working"
            transition={{ duration: animate ? 0.16 : 0, ease: easeOut }}
          >
            <Loader2
              className={`w-4 h-4 text-emerald-400 ${
                animate ? "animate-spin" : ""
              }`}
            />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

export function ReceiptPrinterStatus({ children, className = '', ...props }) {
  const { animate, shouldMove, stage } = useReceiptPrinter(
    "ReceiptPrinter.Status"
  )

  return (
    <div
      className={`flex min-w-0 items-center gap-2 ${className}`}
      {...props}
    >
      <StatusIndicator animate={animate} move={shouldMove} stage={stage} />
      <div
        aria-live="polite"
        className="grid min-w-0 flex-1 items-center"
        role="status"
      >
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            className="col-start-1 row-start-1 truncate font-medium text-xs text-gray-300 leading-none"
            exit={{
              opacity: animate ? 0 : 1,
              transform: shouldMove ? "translateY(-4px)" : "translateY(0px)",
            }}
            initial={{
              opacity: animate ? 0 : 1,
              transform: shouldMove ? "translateY(4px)" : "translateY(0px)",
            }}
            key={stage}
            transition={{ duration: animate ? 0.18 : 0, ease: easeOut }}
          >
            {children ?? statusLabels[stage]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export function ReceiptPrinterPaper({
  children,
  className = '',
  style = {},
  ...props
}) {
  return (
    <article
      className={`receipt-paper-printable relative z-10 bg-[#FFFEFA] px-6 pt-5 pb-8 font-mono text-gray-900 border border-gray-200/80 shadow-[0_10px_28px_rgba(0,0,0,0.16)] ${className}`}
      style={{ clipPath: receiptClipPath, ...style }}
      {...props}
    >
      {children}
    </article>
  )
}

export function ReceiptPrinterOutput({
  children,
  className = '',
  ...props
}) {
  const { animate, feedMotion, shouldMove, stage } = useReceiptPrinter(
    "ReceiptPrinter.Output"
  )
  const isReceiptVisible = stage !== "processing"
  const shouldUseSteppedFeed =
    feedMotion === "stepped" && stage === "printing" && shouldMove

  return (
    <div
      className={`relative z-50 -mt-3.5 w-[calc(88%+1.5rem)] max-w-full px-4 ${stage === 'complete' ? 'overflow-visible' : 'overflow-hidden'} pb-6 ${className}`}
      {...props}
    >
      {isReceiptVisible ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 -top-1 z-20 h-2.5 bg-black/70 blur-[4px]"
        />
      ) : null}

      <motion.div
        animate={{
          opacity: isReceiptVisible ? 1 : 0,
          transform:
            stage === "printing" && shouldMove
              ? shouldUseSteppedFeed
                ? printingTransformKeyframes
                : "translateY(0%)"
              : isReceiptVisible || !shouldMove
                ? "translateY(0%)"
                : "translateY(calc(-100% + 2px))",
        }}
        aria-hidden={stage !== "complete"}
        className="relative isolate"
        initial={false}
        transition={{
          opacity: { duration: animate ? 0.16 : 0, ease: easeOut },
          transform: {
            duration: shouldMove ? 2.0 : 0,
            ease: shouldUseSteppedFeed ? "linear" : easeInOut,
            times: shouldUseSteppedFeed ? printingKeyframeTimes : undefined,
          },
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}

export const ReceiptPrinter = {
  Header: ReceiptPrinterHeader,
  Machine: ReceiptPrinterMachine,
  Output: ReceiptPrinterOutput,
  Paper: ReceiptPrinterPaper,
  Root: ReceiptPrinterRoot,
  Screen: ReceiptPrinterScreen,
  Status: ReceiptPrinterStatus,
}
