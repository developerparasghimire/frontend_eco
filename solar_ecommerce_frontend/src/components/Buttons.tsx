import Link from 'next/link';
import React from 'react';

interface PrimaryButtonProps {
  href?: string;
  children?: React.ReactNode;
  green?: boolean;
}

export function PrimaryButton({ href = '#', children = 'Contact Us', green = false }: PrimaryButtonProps) {
  return (
    <Link href={href} className={green ? 'pill-btn pill-btn--green' : 'pill-btn pill-btn--blue'}>
      <span>{children}</span>
      <span className="pill-btn__icon">→</span>
    </Link>
  );
}

interface SecondaryButtonProps {
  href?: string;
  children?: React.ReactNode;
}

export function SecondaryButton({ href = '#', children = 'See Detail' }: SecondaryButtonProps) {
  return (
    <Link href={href} className="small-btn">
      <span>{children}</span>
      <span className="small-btn__icon">→</span>
    </Link>
  );
}
