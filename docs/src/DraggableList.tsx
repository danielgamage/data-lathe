import React, { useEffect, useRef } from "react"
import { useSprings, animated, config } from "@react-spring/web"
import { useDrag } from "@use-gesture/react"
import { clamp } from "lodash"
import swap from "lodash-move"

let scrollOffsets: { top: number; height: number }[] = []

const fn =
  (order: number[], active = false, originalIndex = 0, prevIndex = 0, y = 0, nextIndex) =>
  (index: number) => {
    console.log({originalIndex, prevIndex, index})
    const movingUp = active && originalIndex < index && nextIndex >= index
    const isAfter = active && originalIndex > index && nextIndex <= index
    return active && index === originalIndex
      ? {
          y: y,
          zIndex: 1,
          shadow: 15,
          immediate: (key: string) => key === "zIndex",
          config: (key: string) =>
            key === "y" ? config.stiff : config.default,
        }
      : {
          y: movingUp ? -32 : isAfter ? 32 : 0,
          zIndex: 0,
          shadow: 1,
          immediate: false
        }
  }
export function DraggableList({
  items,
  onReorder,
  itemRenderer,
}: {
  items: string[]
  onReorder: (newValue: any[]) => void
  itemRenderer: (
    item: any,
    bindDrag: Function,
    index: number
  ) => React.ReactNode
}) {
  const order = useRef(items.map((_, index) => index)) // Store indicies as a local ref, this represents the item order
  order.current = items.map((_, index) => index)
  const [springs, api] = useSprings(items.length, fn(order.current)) // Create springs, each corresponds to an item, controlling its transform, scale, etc.
  const bindDrag = useDrag(
    ({ args: [originalIndex], active, movement: [, my], first, last }) => {
      if (first) {
        scrollOffsets = Array.from(
          document.querySelectorAll(".DraggableList__item")
        ).map((el) => ({ top: el.offsetTop, height: el.offsetHeight }))
      }

      const originalOffset = scrollOffsets[originalIndex]
      const headerHeight = scrollOffsets.reduce(
        (acc, cur) => Math.min(acc, cur.height),
        99999
      )
      const y = originalOffset.top + headerHeight / 2 + my

      // index in `order` array
      const prevIndex = order.current.indexOf(originalIndex)
      const initnextIndex = scrollOffsets.findIndex(
        (offset) => y < offset.top + offset.height / 2
      )
      const nextIndex = initnextIndex === -1 ? items.length - 1 : initnextIndex

      const newOrder = swap(order.current, prevIndex, nextIndex)
      const newItems = swap(items, prevIndex, nextIndex)
      api.start(fn(newOrder, active, originalIndex, prevIndex, my, nextIndex)) // Feed springs new style data, they'll animate the view without causing a single render

      if (!active) order.current = newOrder

      if (last) {
        console.log(
          scrollOffsets,
          scrollOffsets.map((offset) => offset.top + offset.height / 2),
          { y, my, prevIndex, initnextIndex, nextIndex, newOrder }
        )
        scrollOffsets = newOrder
        onReorder(newItems)
      }
    }
  )

  return (
    <div style={{ position: "relative" }}>
      {springs.map(({ zIndex, shadow, y }, i) => (
        <animated.div
          className="DraggableList__item"
          key={items[i].id}
          style={{
            zIndex,
            boxShadow: shadow.to(
              (s) => `rgba(0, 0, 0, 0.15) 0px ${s}px ${2 * s}px 0px`
            ),
            y,
          }}
        >
          {itemRenderer(items[i], bindDrag, i)}
        </animated.div>
      ))}
    </div>
  )
}
