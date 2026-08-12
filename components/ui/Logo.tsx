import Image from "next/image";


const SIZES = {
  sm: "h-9 w-12",
  md: "h-12 w-16",
  lg: "h-16 w-[5.5rem]",
} as const;

export function Logo({
  size = "md",
  className = "",
  priority = false,
}: {
  size?: keyof typeof SIZES;
  className?: string;
  priority?: boolean;
}) {
  return (
    <span
      className={`relative block shrink-0 overflow-hidden ${SIZES[size]} ${className}`}
    >
      <Image
        src="/image.png"
        alt="خضارك"
        fill
        priority={priority}
        sizes="128px"
        className="scale-[1.8] object-contain mix-blend-multiply"
      />
    </span>
  );
}
